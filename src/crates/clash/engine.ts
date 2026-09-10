import type { BuildingComponent, BuildingGraph } from "@/crates/building-graph/types";

export type ClashKind = "GEOMETRIC_CLASH" | "DISCONNECTED_SYSTEM" | "MISSING_PENETRATION" | "OCCUPIED_SPACE";

export type ClashFinding = {
  id: string;
  kind: ClashKind;
  a: string;
  b: string;
  reason: string;
};

const SOLID_HOST = new Set([
  "common-stud",
  "king-stud",
  "jack-stud",
  "bottom-plate",
  "top-plate",
  "sill-plate",
  "foundation-wall",
]);

const SERVICE = new Set(["pipe-supply", "pipe-dwv", "pipe-vent", "cable", "duct", "refrigerant-line"]);

const LONG_RUN_M = 1.4;
const LIVING_ABOVE_FLOOR_M = 0.08;
const LIVING_BELOW_CEILING_M = 0.1;
const WALL_CAVITY_M = 0.35;

function aabb(c: BuildingComponent): { min: [number, number, number]; max: [number, number, number] } | null {
  if (c.geometry.kind !== "box") return null;
  if (c.geometry.rotation) return null;
  const [x, y, z] = c.geometry.center;
  const [sx, sy, sz] = c.geometry.size;
  return {
    min: [x - sx / 2, y - sy / 2, z - sz / 2],
    max: [x + sx / 2, y + sy / 2, z + sz / 2],
  };
}

function overlapVolume(a: NonNullable<ReturnType<typeof aabb>>, b: NonNullable<ReturnType<typeof aabb>>): number {
  const dx = Math.max(0, Math.min(a.max[0], b.max[0]) - Math.max(a.min[0], b.min[0]));
  const dy = Math.max(0, Math.min(a.max[1], b.max[1]) - Math.max(a.min[1], b.min[1]));
  const dz = Math.max(0, Math.min(a.max[2], b.max[2]) - Math.max(a.min[2], b.min[2]));
  return dx * dy * dz;
}

function volumeOf(c: BuildingComponent): number {
  const [sx, sy, sz] = c.geometry.size;
  return Math.abs(sx * sy * sz);
}

function isVerticalRiser(c: BuildingComponent): boolean {
  const [sx, sy, sz] = c.geometry.size;
  const horiz = Math.max(sx, sz);
  return sy >= 0.4 && sy >= horiz * 1.5;
}

function isWallHosted(c: BuildingComponent): boolean {
  const keys = [c.parentId, c.assembly?.explodeGroup];
  return keys.some((k) => typeof k === "string" && k.includes("assembly.wall"));
}

function livingEnvelope(comps: BuildingComponent[]): {
  yMin: number;
  yMax: number;
  xMin: number;
  xMax: number;
  zMin: number;
  zMax: number;
} | null {
  const floors = comps.filter((c) => c.type === "subfloor");
  const plates = comps.filter((c) => c.type === "top-plate");
  if (floors.length === 0 || plates.length === 0) return null;
  let xMin = Infinity;
  let xMax = -Infinity;
  let zMin = Infinity;
  let zMax = -Infinity;
  let floorTop = -Infinity;
  let ceiling = Infinity;
  for (const f of floors) {
    const box = aabb(f);
    if (!box) continue;
    xMin = Math.min(xMin, box.min[0]);
    xMax = Math.max(xMax, box.max[0]);
    zMin = Math.min(zMin, box.min[2]);
    zMax = Math.max(zMax, box.max[2]);
    floorTop = Math.max(floorTop, box.max[1]);
  }
  for (const p of plates) {
    const box = aabb(p);
    if (!box) continue;
    ceiling = Math.min(ceiling, box.max[1]);
  }
  if (!Number.isFinite(floorTop) || !Number.isFinite(ceiling) || ceiling <= floorTop) return null;
  return {
    yMin: floorTop + LIVING_ABOVE_FLOOR_M,
    yMax: ceiling - LIVING_BELOW_CEILING_M,
    xMin,
    xMax,
    zMin,
    zMax,
  };
}

function nearExteriorWall(
  c: BuildingComponent,
  env: NonNullable<ReturnType<typeof livingEnvelope>>,
): boolean {
  const [x, , z] = c.geometry.center;
  const [sx, , sz] = c.geometry.size;
  const thinX = sx <= 0.2;
  const thinZ = sz <= 0.2;
  if (thinX && (x - env.xMin <= WALL_CAVITY_M || env.xMax - x <= WALL_CAVITY_M)) return true;
  if (thinZ && (z - env.zMin <= WALL_CAVITY_M || env.zMax - z <= WALL_CAVITY_M)) return true;
  return false;
}

/**
 * Long distribution runs whose centreline sits in the occupied living volume
 * (above the subfloor, below the ceiling, not in a wall cavity).
 * Project geometry fact — not an NPC/CEC clause.
 */
export function findOccupiedSpaceRuns(
  graph: BuildingGraph,
  removedIds: readonly string[] = [],
): ClashFinding[] {
  const removed = new Set(removedIds);
  const comps = Object.values(graph.components).filter(
    (c) => c.geometry.kind === "box" && !removed.has(c.id) && !c.geometry.rotation,
  );
  const env = livingEnvelope(comps);
  if (!env) return [];
  const findings: ClashFinding[] = [];
  for (const svc of comps) {
    if (!SERVICE.has(svc.type)) continue;
    if (isVerticalRiser(svc)) continue;
    if (isWallHosted(svc)) continue;
    const [sx, , sz] = svc.geometry.size;
    if (Math.max(sx, sz) < LONG_RUN_M) continue;
    const [x, y, z] = svc.geometry.center;
    if (y <= env.yMin || y >= env.yMax) continue;
    if (x < env.xMin || x > env.xMax || z < env.zMin || z > env.zMax) continue;
    if (nearExteriorWall(svc, env)) continue;
    findings.push({
      id: `occupied.${svc.id}`,
      kind: "OCCUPIED_SPACE",
      a: svc.id,
      b: "living-volume",
      reason: `${svc.label} runs through occupied living space instead of a floor cavity, wall cavity, or ceiling/attic.`,
    });
  }
  return findings;
}

/**
 * Deterministic geometric clashes. These are project facts, not code violations.
 * Penetrations registered on the graph are treated as intended openings.
 * Occupied-space findings are routing errors, not AABB overlaps with a host.
 */
export function findClashes(graph: BuildingGraph, removedIds: readonly string[] = []): ClashFinding[] {
  const removed = new Set(removedIds);
  const findings: ClashFinding[] = [];
  const comps = Object.values(graph.components).filter(
    (c) => c.geometry.kind === "box" && !removed.has(c.id) && !c.geometry.rotation,
  );
  const penetrations = comps.filter((c) => c.type === "penetration" && c.penetration);
  const intended = new Set<string>();
  for (const p of penetrations) {
    const ref = p.penetration!;
    intended.add(`${ref.hostId}|${ref.tradeComponentId}`);
    intended.add(`${ref.tradeComponentId}|${ref.hostId}`);
  }

  const hosts = comps.filter((c) => SOLID_HOST.has(c.type));
  const services = comps.filter((c) => SERVICE.has(c.type));

  for (const svc of services) {
    const sa = aabb(svc);
    if (!sa) continue;
    const svcVol = volumeOf(svc);
    if (svcVol < 1e-8) continue;
    for (const host of hosts) {
      if (intended.has(`${host.id}|${svc.id}`)) continue;
      const ha = aabb(host);
      if (!ha) continue;
      const vol = overlapVolume(sa, ha);
      if (vol < 0.35 * Math.min(svcVol, volumeOf(host))) continue;
      if (vol < 8e-5) continue;
      findings.push({
        id: `clash.${svc.id}.${host.id}`,
        kind: "GEOMETRIC_CLASH",
        a: svc.id,
        b: host.id,
        reason: `${svc.label} occupies volume of ${host.label} without a modelled penetration.`,
      });
    }
  }

  for (const p of penetrations) {
    const ref = p.penetration!;
    if (!graph.components[ref.hostId]) {
      findings.push({
        id: `pen-host.${p.id}`,
        kind: "MISSING_PENETRATION",
        a: p.id,
        b: ref.hostId,
        reason: `Penetration ${p.id} references missing host ${ref.hostId}.`,
      });
    }
    if (!graph.components[ref.tradeComponentId]) {
      findings.push({
        id: `pen-trade.${p.id}`,
        kind: "MISSING_PENETRATION",
        a: p.id,
        b: ref.tradeComponentId,
        reason: `Penetration ${p.id} references missing trade component ${ref.tradeComponentId}.`,
      });
    }
  }

  for (const sys of graph.systems) {
    const nodeById = new Map(sys.nodes.map((n) => [n.id, n]));
    for (const n of sys.nodes) {
      if (!graph.components[n.componentId]) {
        findings.push({
          id: `sys-node.${sys.id}.${n.id}`,
          kind: "DISCONNECTED_SYSTEM",
          a: n.componentId,
          b: sys.id,
          reason: `System ${sys.trade} node ${n.id} does not resolve to a building component.`,
        });
      }
    }
    for (const c of sys.connections) {
      if (!nodeById.has(c.from) || !nodeById.has(c.to)) {
        findings.push({
          id: `sys-conn.${c.id}`,
          kind: "DISCONNECTED_SYSTEM",
          a: c.from,
          b: c.to,
          reason: `System connection ${c.id} references a missing node.`,
        });
      }
    }
  }

  findings.push(...findOccupiedSpaceRuns(graph, removedIds));
  return findings;
}
