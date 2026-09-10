import type { BuildingGraph } from "@/crates/building-graph/types";

export type RecreationFinding = {
  id: string;
  kind: "THROUGH_WATER" | "DISCONNECTED_CIRCULATION" | "EQUIPMENT_OFF_PAD" | "FLOATING_EQUIPMENT";
  a: string;
  b: string;
  reason: string;
};

function aabb(c: { geometry: { kind: string; center: [number, number, number]; size: [number, number, number]; rotation?: unknown } }) {
  if (c.geometry.kind !== "box" || c.geometry.rotation) return null;
  const [x, y, z] = c.geometry.center;
  const [sx, sy, sz] = c.geometry.size;
  return {
    min: [x - sx / 2, y - sy / 2, z - sz / 2] as [number, number, number],
    max: [x + sx / 2, y + sy / 2, z + sz / 2] as [number, number, number],
  };
}

function overlap(a: NonNullable<ReturnType<typeof aabb>>, b: NonNullable<ReturnType<typeof aabb>>) {
  const dx = Math.max(0, Math.min(a.max[0], b.max[0]) - Math.max(a.min[0], b.min[0]));
  const dy = Math.max(0, Math.min(a.max[1], b.max[1]) - Math.max(a.min[1], b.min[1]));
  const dz = Math.max(0, Math.min(a.max[2], b.max[2]) - Math.max(a.min[2], b.min[2]));
  return dx * dy * dz;
}

function onPad(equip: NonNullable<ReturnType<typeof aabb>>, pad: NonNullable<ReturnType<typeof aabb>>) {
  const cx = (equip.min[0] + equip.max[0]) / 2;
  const cz = (equip.min[2] + equip.max[2]) / 2;
  return cx >= pad.min[0] - 0.05 && cx <= pad.max[0] + 0.05 && cz >= pad.min[2] - 0.05 && cz <= pad.max[2] + 0.05;
}

/**
 * Geometric recreation facts. Not CEC Section 68.
 */
export function findRecreationIssues(graph: BuildingGraph, removedIds: readonly string[] = []): RecreationFinding[] {
  const removed = new Set(removedIds);
  const comps = Object.values(graph.components).filter((c) => !removed.has(c.id));
  const out: RecreationFinding[] = [];
  const waters = comps.filter((c) => c.type === "water-volume" || c.type === "pool" || c.type === "hot-tub");
  const services = comps.filter((c) => c.type === "cable" || c.type === "pipe-supply" || c.type === "pipe-dwv");
  for (const svc of services) {
    const tags = svc.tags ?? [];
    if (tags.includes("circulation") || tags.includes("bonding") || tags.includes("pool") || tags.includes("hot-tub")) continue;
    const sa = aabb(svc);
    if (!sa) continue;
    for (const w of waters) {
      const wa = aabb(w);
      if (!wa) continue;
      if (overlap(sa, wa) > 8e-5) {
        out.push({
          id: `rec.water.${svc.id}.${w.id}`,
          kind: "THROUGH_WATER",
          a: svc.id,
          b: w.id,
          reason: `${svc.label} occupies ${w.label}. A dwelling cable or pipe does not pass through a pool or hot-tub vessel.`,
        });
      }
    }
  }

  const pads = comps.filter((c) => c.type === "equipment-pad");
  const equipment = comps.filter((c) => c.type === "pump" || c.type === "filter" || ((c.tags ?? []).includes("equipment") && (c.type === "heat-pump-outdoor" || c.type === "hot-tub")));
  for (const eq of equipment) {
    const ea = aabb(eq);
    if (!ea) continue;
    if (pads.length === 0) {
      out.push({
        id: `rec.float.${eq.id}`,
        kind: "FLOATING_EQUIPMENT",
        a: eq.id,
        b: "pad",
        reason: `${eq.label} has no equipment pad in the graph.`,
      });
      continue;
    }
    const seated = pads.some((p) => {
      const pa = aabb(p);
      return pa ? onPad(ea, pa) : false;
    });
    if (!seated) {
      out.push({
        id: `rec.offpad.${eq.id}`,
        kind: "EQUIPMENT_OFF_PAD",
        a: eq.id,
        b: pads[0]!.id,
        reason: `${eq.label} is not on its declared pad.`,
      });
    }
  }

  const pool = comps.find((c) => c.type === "pool");
  if (pool) {
    const sys = graph.systems.find((s) => s.id === "system.pool");
    if (!sys || sys.connections.length < 4) {
      out.push({
        id: "rec.circ.missing",
        kind: "DISCONNECTED_CIRCULATION",
        a: pool.id,
        b: "system.pool",
        reason: "A pool is present without a connected suction/pump/filter/return loop.",
      });
    } else {
      const ids = new Set(sys.connections.flatMap((c) => [c.from, c.to]));
      for (const need of ["pool.pump.001", "pool.filter.001", "pool.pipe.suction.001", "pool.pipe.return.001"]) {
        if (!ids.has(need) && !removed.has(need)) {
          out.push({
            id: `rec.circ.${need}`,
            kind: "DISCONNECTED_CIRCULATION",
            a: pool.id,
            b: need,
            reason: `Pool circulation is missing ${need}.`,
          });
        }
      }
    }
  }
  return out;
}
