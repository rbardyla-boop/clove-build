import type { BuildingComponent, BuildingGraph } from "@/crates/building-graph/types";
import { P, Y, halfL, halfW } from "@/specimen/pei-part9-house/params";
import { SERVICE_ALLOWED_ZONES, zoneAllowsExposedService, type SpaceZoneId } from "./zones";

const WALL_CAVITY_M = 0.38;
const LONG_M = 1.2;

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

function nearWall(c: BuildingComponent, env: EnvelopeBounds): boolean {
  const [x, , z] = c.geometry.center;
  const [sx, , sz] = c.geometry.size;
  if (sx <= 0.22 && (x - env.xMin <= WALL_CAVITY_M || env.xMax - x <= WALL_CAVITY_M)) return true;
  if (sz <= 0.22 && (z - env.zMin <= WALL_CAVITY_M || env.zMax - z <= WALL_CAVITY_M)) return true;
  const group = c.assembly?.explodeGroup ?? "";
  const parent = c.parentId ?? "";
  return group.includes("assembly.wall") || parent.includes("assembly.wall");
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
  if (y > env.wallTop - 0.22 && y <= env.wallTop + 0.08 && !nearWall(c, env)) return "CEILING_CAVITY";
  if (nearWall(c, env) && y >= env.floorTop - 0.05 && y <= env.wallTop + 0.05) {
    return isVertical(c) ? "SHAFT" : "WALL_CAVITY";
  }
  if (y < env.floorTop - 0.02 && y >= env.sillTop - 0.25) return "FLOOR_CAVITY";
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
