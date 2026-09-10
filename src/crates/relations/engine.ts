import type { BuildingComponent, BuildingGraph, Relation } from "@/crates/building-graph/types";

export type RelationFinding = {
  id: string;
  relationId: string;
  ok: boolean;
  reason: string;
};

type Aabb = { min: [number, number, number]; max: [number, number, number] };

function aabb(c: BuildingComponent): Aabb | null {
  if (c.geometry.rotation) return null;
  const [x, y, z] = c.geometry.center;
  const [sx, sy, sz] = c.geometry.size;
  return {
    min: [x - sx / 2, y - sy / 2, z - sz / 2],
    max: [x + sx / 2, y + sy / 2, z + sz / 2],
  };
}

function overlap(a: Aabb, b: Aabb): number {
  const dx = Math.max(0, Math.min(a.max[0], b.max[0]) - Math.max(a.min[0], b.min[0]));
  const dy = Math.max(0, Math.min(a.max[1], b.max[1]) - Math.max(a.min[1], b.min[1]));
  const dz = Math.max(0, Math.min(a.max[2], b.max[2]) - Math.max(a.min[2], b.min[2]));
  return dx * dy * dz;
}

function volume(a: Aabb): number {
  return Math.max(0, a.max[0] - a.min[0]) * Math.max(0, a.max[1] - a.min[1]) * Math.max(0, a.max[2] - a.min[2]);
}

function contained(inner: Aabb, outer: Aabb, eps = 0.04): boolean {
  return (
    inner.min[0] >= outer.min[0] - eps &&
    inner.max[0] <= outer.max[0] + eps &&
    inner.min[2] >= outer.min[2] - eps &&
    inner.max[2] <= outer.max[2] + eps
  );
}

export function evaluateRelation(graph: BuildingGraph, rel: Relation): RelationFinding {
  const a = graph.components[rel.a];
  const b = graph.components[rel.b];
  if (!a || !b) {
    return { id: `rel.${rel.id}`, relationId: rel.id, ok: false, reason: `Relation ${rel.id} references a missing member.` };
  }
  const aa = aabb(a);
  const bb = aabb(b);
  if (!aa || !bb) {
    return { id: `rel.${rel.id}`, relationId: rel.id, ok: false, reason: `Relation ${rel.id} needs axis-aligned boxes.` };
  }
  switch (rel.kind) {
    case "contained-in": {
      const ok = contained(aa, bb) && overlap(aa, bb) > 1e-6;
      return {
        id: `rel.${rel.id}`,
        relationId: rel.id,
        ok,
        reason: ok ? `${a.label} sits in ${b.label}.` : `${a.label} is not contained in ${b.label}.`,
      };
    }
    case "supported-by": {
      const gap = aa.min[1] - bb.max[1];
      const ok = Math.abs(gap) < 0.12 && overlap({ ...aa, min: [aa.min[0], bb.max[1] - 0.05, aa.min[2]], max: [aa.max[0], bb.max[1] + 0.05, aa.max[2]] }, bb) > 1e-6;
      return {
        id: `rel.${rel.id}`,
        relationId: rel.id,
        ok,
        reason: ok ? `${a.label} bears on ${b.label}.` : `${a.label} is not bearing on ${b.label}.`,
      };
    }
    case "aligned-with": {
      const axis = rel.axis ?? 0;
      const ok = Math.abs(a.geometry.center[axis] - b.geometry.center[axis]) < (rel.value ?? 0.15);
      return {
        id: `rel.${rel.id}`,
        relationId: rel.id,
        ok,
        reason: ok ? `${a.label} aligns with ${b.label}.` : `${a.label} is not aligned with ${b.label}.`,
      };
    }
    case "centred-in": {
      const ok =
        Math.abs(a.geometry.center[0] - b.geometry.center[0]) < 0.12 &&
        Math.abs(a.geometry.center[2] - b.geometry.center[2]) < 0.12;
      return {
        id: `rel.${rel.id}`,
        relationId: rel.id,
        ok,
        reason: ok ? `${a.label} is centred on ${b.label}.` : `${a.label} is not centred on ${b.label}.`,
      };
    }
    case "penetrates": {
      const ok = overlap(aa, bb) > 1e-6;
      return {
        id: `rel.${rel.id}`,
        relationId: rel.id,
        ok,
        reason: ok ? `${a.label} intersects ${b.label}.` : `${a.label} does not intersect ${b.label}.`,
      };
    }
    case "above": {
      const ok = aa.min[1] >= bb.max[1] - 0.05;
      return {
        id: `rel.${rel.id}`,
        relationId: rel.id,
        ok,
        reason: ok ? `${a.label} is above ${b.label}.` : `${a.label} is not above ${b.label}.`,
      };
    }
    case "below": {
      const ok = aa.max[1] <= bb.min[1] + 0.05;
      return {
        id: `rel.${rel.id}`,
        relationId: rel.id,
        ok,
        reason: ok ? `${a.label} is below ${b.label}.` : `${a.label} is not below ${b.label}.`,
      };
    }
    case "attached-to": {
      const ok = overlap(aa, bb) > 0 || Math.abs(aa.min[1] - bb.max[1]) < 0.08;
      return {
        id: `rel.${rel.id}`,
        relationId: rel.id,
        ok,
        reason: ok ? `${a.label} meets ${b.label}.` : `${a.label} does not meet ${b.label}.`,
      };
    }
    case "clearance-between": {
      const need = rel.value ?? 0.3;
      const dx = Math.max(0, Math.max(aa.min[0] - bb.max[0], bb.min[0] - aa.max[0]));
      const dz = Math.max(0, Math.max(aa.min[2] - bb.max[2], bb.min[2] - aa.max[2]));
      const gap = Math.hypot(dx, dz);
      const ok = gap + 1e-6 >= need;
      return {
        id: `rel.${rel.id}`,
        relationId: rel.id,
        ok,
        reason: ok
          ? `Clearance ${gap.toFixed(2)} m ≥ ${need} m (project model, not a licensed code distance).`
          : `Clearance ${gap.toFixed(2)} m is less than the modelled ${need} m.`,
      };
    }
    default: {
      void volume;
      return { id: `rel.${rel.id}`, relationId: rel.id, ok: true, reason: `Relation ${rel.kind} is recorded but not geometrically evaluated.` };
    }
  }
}

export function evaluateRelations(graph: BuildingGraph): RelationFinding[] {
  return (graph.relations ?? []).map((r) => evaluateRelation(graph, r));
}
