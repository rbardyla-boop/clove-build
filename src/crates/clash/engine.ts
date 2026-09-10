import type { BuildingComponent, BuildingGraph } from "@/crates/building-graph/types";

export type ClashKind = "GEOMETRIC_CLASH" | "DISCONNECTED_SYSTEM" | "MISSING_PENETRATION";

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

/**
 * Deterministic geometric clashes. These are project facts, not code violations.
 * Penetrations registered on the graph are treated as intended openings.
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

  return findings;
}
