import type { BuildingComponent, BuildingGraph } from "@/crates/building-graph/types";
import { P, Y, halfL, halfW } from "@/specimen/pei-part9-house/params";
import { SERVICE_ALLOWED_ZONES, zoneAllowsExposedService, type SpaceZoneId } from "./zones";

const LONG_M = 1.2;
const CAVITY_EXPAND_M = 0.025;

export type EnvelopeBounds = {
  xMin: number;
  xMax: number;
  zMin: number;
  zMax: number;
  floorTop: number;
  wallTop: number;
  sillTop: number;
  grade: number;
  ridgeY: number;
};

type Aabb = { min: [number, number, number]; max: [number, number, number] };

function aabbOf(c: BuildingComponent): Aabb | null {
  if (c.geometry.rotation) return null;
  const [x, y, z] = c.geometry.center;
  const [sx, sy, sz] = c.geometry.size;
  return {
    min: [x - sx / 2, y - sy / 2, z - sz / 2],
    max: [x + sx / 2, y + sy / 2, z + sz / 2],
  };
}

function overlapVolume(a: Aabb, b: Aabb): number {
  const dx = Math.max(0, Math.min(a.max[0], b.max[0]) - Math.max(a.min[0], b.min[0]));
  const dy = Math.max(0, Math.min(a.max[1], b.max[1]) - Math.max(a.min[1], b.min[1]));
  const dz = Math.max(0, Math.min(a.max[2], b.max[2]) - Math.max(a.min[2], b.min[2]));
  return dx * dy * dz;
}

function pointIn(x: number, y: number, z: number, b: Aabb): boolean {
  return x >= b.min[0] && x <= b.max[0] && y >= b.min[1] && y <= b.max[1] && z >= b.min[2] && z <= b.max[2];
}

export function envelopeBounds(_graph: BuildingGraph): EnvelopeBounds {
  return {
    xMin: -halfL,
    xMax: halfL,
    zMin: -halfW,
    zMax: halfW,
    floorTop: Y.floorTop,
    wallTop: Y.wallTop,
    sillTop: Y.sillTop,
    grade: P.grade,
    ridgeY: Y.ridgeY,
  };
}

function isVertical(c: BuildingComponent): boolean {
  const [sx, sy, sz] = c.geometry.size;
  return sy >= 0.4 && sy >= Math.max(sx, sz) * 1.4;
}

function isFixtureOrCabinetTrap(c: BuildingComponent): boolean {
  if (c.type === "fixture" || (c.tags ?? []).includes("fixture")) return true;
  if (c.type !== "trap") return false;
  const tags = c.tags ?? [];
  return tags.includes("cabinet-trap") || tags.includes("fixture-trap");
}

/** Bottom-plate XZ extruded floor-to-plate-top, plus 25 mm — not a 350 mm room heuristic. */
export function wallCavityAabbs(graph: BuildingGraph): Aabb[] {
  const env = envelopeBounds(graph);
  const out: Aabb[] = [];
  for (const c of Object.values(graph.components)) {
    if (c.type !== "bottom-plate") continue;
    const a = aabbOf(c);
    if (!a) continue;
    out.push({
      min: [a.min[0] - CAVITY_EXPAND_M, env.floorTop - 0.02, a.min[2] - CAVITY_EXPAND_M],
      max: [a.max[0] + CAVITY_EXPAND_M, env.wallTop + 0.02, a.max[2] + CAVITY_EXPAND_M],
    });
  }
  return out;
}

export function inWallCavity(graph: BuildingGraph, c: BuildingComponent): boolean {
  if (isFixtureOrCabinetTrap(c)) return false;
  const sa = aabbOf(c);
  if (!sa) return false;
  const [x, y, z] = c.geometry.center;
  const [sx, sy, sz] = c.geometry.size;
  const vol = Math.abs(sx * sy * sz);
  for (const w of wallCavityAabbs(graph)) {
    const ov = overlapVolume(sa, w);
    if (ov < 1e-6) continue;
    if (pointIn(x, y, z, w)) return true;
    if (isVertical(c) && x >= w.min[0] && x <= w.max[0] && z >= w.min[2] && z <= w.max[2]) return true;
    if (vol > 0 && ov > 0.5 * vol) return true;
  }
  return false;
}

function outsideFootprint(c: BuildingComponent, env: EnvelopeBounds): boolean {
  const [x, , z] = c.geometry.center;
  return x < env.xMin - 0.15 || x > env.xMax + 0.15 || z < env.zMin - 0.15 || z > env.zMax + 0.15;
}

/**
 * Geometric classification of where a member lives.
 * Project fact — not a code occupancy classification.
 */
export function classifyComponent(graph: BuildingGraph, c: BuildingComponent): SpaceZoneId {
  const env = envelopeBounds(graph);
  const tags = c.tags ?? [];
  const [, y] = c.geometry.center;
  if (c.type === "service-entry" || tags.includes("service-entry")) return "SERVICE_ENTRY";
  if (c.type === "heat-pump-outdoor" || tags.includes("exterior-equipment")) return "EXTERIOR";
  if (outsideFootprint(c, env) && y >= env.grade - 0.2) return "EXTERIOR";
  if (y < env.grade - 0.15) return "BELOW_GRADE";
  if (tags.includes("chase")) return "CHASE";
  if (tags.includes("soffit") || (y > env.wallTop - 0.35 && outsideFootprint(c, env))) return "SOFFIT";
  if (y >= env.ridgeY - 0.25) return "ROOF_SPACE";
  if (y > env.wallTop + 0.08) return "ATTIC";
  const wall = inWallCavity(graph, c);
  if (y > env.wallTop - 0.22 && y <= env.wallTop + 0.08 && !wall) return "CEILING_CAVITY";
  if (wall && isVertical(c)) return "SHAFT";
  if (wall && y >= env.floorTop - 0.05 && y <= env.wallTop + 0.05) return "WALL_CAVITY";
  if (y < env.floorTop - 0.02 && y >= env.sillTop - 0.02) return "FLOOR_CAVITY";
  if (y < env.sillTop - 0.02 && y >= env.sillTop - 0.4) return "UNDER_FLOOR";
  if (y < env.sillTop - 0.02 && y >= env.grade - 0.05) return "MECHANICAL_SPACE";
  if (y < env.floorTop && y >= env.grade - 0.05) return "UNDER_FLOOR";
  if (y > env.floorTop + 0.06 && y < env.wallTop - 0.08) return "OCCUPIED_ROOM";
  if (y <= env.floorTop + 0.06 && y >= env.sillTop) return "FLOOR_CAVITY";
  return "OCCUPIED_ROOM";
}

export function classifyId(graph: BuildingGraph, id: string): SpaceZoneId | undefined {
  const c = graph.components[id];
  if (!c) return undefined;
  return classifyComponent(graph, c);
}

export function serviceRunTooLongInOccupied(c: BuildingComponent): boolean {
  const [sx, , sz] = c.geometry.size;
  return Math.max(sx, sz) >= LONG_M;
}

export function zoneIsServiceLegal(zone: SpaceZoneId, exposed: boolean): boolean {
  if (exposed) return zoneAllowsExposedService(zone);
  return SERVICE_ALLOWED_ZONES.has(zone);
}
