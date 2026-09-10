import type { BuildingComponent, BuildingGraph } from "@/crates/building-graph/types";

const SOLID = new Set(["common-stud", "king-stud", "jack-stud", "bottom-plate", "top-plate"]);
const EPS = 1e-4;
const OVERLAP_M3 = 1e-6;
/** Declared WET-WALL clearance: 20 mm per cavity face, not 10 mm. */
const MIN_SIDE_M = 0.02;

type Aabb = { min: [number, number, number]; max: [number, number, number] };

function aabb(c: BuildingComponent): Aabb | null {
  if (c.geometry.rotation) return null;
  if (c.geometry.kind !== "box" && c.geometry.kind !== "group") return null;
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

function clipY(a: Aabb, yMin: number, yMax: number): Aabb | null {
  const minY = Math.max(a.min[1], yMin);
  const maxY = Math.min(a.max[1], yMax);
  if (maxY - minY < EPS) return null;
  return { min: [a.min[0], minY, a.min[2]], max: [a.max[0], maxY, a.max[2]] };
}

function containedIn(inner: Aabb, outer: Aabb, axis: 0 | 2): { ok: boolean; leftover: number } {
  const lo = inner.min[axis] - outer.min[axis];
  const hi = outer.max[axis] - inner.max[axis];
  const leftover = Math.min(lo, hi);
  const along = axis === 0 ? 2 : 0;
  const alongOk = inner.min[along] >= outer.min[along] - EPS && inner.max[along] <= outer.max[along] + EPS;
  return { ok: leftover + 1e-9 >= MIN_SIDE_M && alongOk, leftover };
}

export type WetWallFit = {
  contained: boolean;
  leftoverMm: number;
  wallDepthMm: number;
  stackDiaMm: number;
  hostHits: string[];
  reason: string;
};

/**
 * Prove the soil stack's wall-height portion sits in the wet-wall cavity
 * and does not occupy studs/plates except at registered penetrations.
 */
export function evaluateWetWallFit(
  graph: BuildingGraph,
  wallId = "assembly.wall.bath",
  stackId = "plumbing.dwv.stack.001",
): WetWallFit {
  const wall = graph.components[wallId];
  const stack = graph.components[stackId];
  const empty: WetWallFit = {
    contained: false,
    leftoverMm: 0,
    wallDepthMm: 0,
    stackDiaMm: 0,
    hostHits: [],
    reason: "Wet wall or soil stack is not in the graph.",
  };
  if (!wall || !stack) return empty;
  const wallA = aabb(wall);
  const stackA = aabb(stack);
  if (!wallA || !stackA) return { ...empty, reason: "Wall or stack is not an axis-aligned box." };

  const clipped = clipY(stackA, wallA.min[1], wallA.max[1]);
  if (!clipped) return { ...empty, reason: "Stack does not occupy the wet-wall height." };

  const thin: 0 | 2 = wall.geometry.size[0] <= wall.geometry.size[2] ? 0 : 2;
  const fit = containedIn(clipped, wallA, thin);
  const wallDepth = thin === 0 ? wall.geometry.size[0] : wall.geometry.size[2];
  const stackDia = thin === 0 ? stack.geometry.size[0] : stack.geometry.size[2];

  const intended = new Set<string>();
  for (const c of Object.values(graph.components)) {
    const p = c.penetration;
    if (!p) continue;
    if (p.tradeComponentId === stackId) intended.add(p.hostId);
  }

  const hostHits: string[] = [];
  for (const c of Object.values(graph.components)) {
    if (c.parentId !== wallId) continue;
    if (!SOLID.has(c.type)) continue;
    if (intended.has(c.id)) continue;
    const ha = aabb(c);
    if (!ha) continue;
    if (overlapVolume(clipped, ha) > OVERLAP_M3) hostHits.push(c.id);
  }

  const leftoverMm = Math.round(fit.leftover * 1000);
  if (!fit.ok) {
    return {
      contained: false,
      leftoverMm,
      wallDepthMm: Math.round(wallDepth * 1000),
      stackDiaMm: Math.round(stackDia * 1000),
      hostHits,
      reason: "The soil stack's wall-height portion is not contained in the wet-wall cavity with 20 mm clearance per face.",
    };
  }
  if (hostHits.length > 0) {
    return {
      contained: false,
      leftoverMm,
      wallDepthMm: Math.round(wallDepth * 1000),
      stackDiaMm: Math.round(stackDia * 1000),
      hostHits,
      reason: `Stack occupies solid framing (${hostHits.join(", ")}) without a modelled penetration.`,
    };
  }
  return {
    contained: true,
    leftoverMm,
    wallDepthMm: Math.round(wallDepth * 1000),
    stackDiaMm: Math.round(stackDia * 1000),
    hostHits: [],
    reason: "Clipped stack sits in the 2×6 cavity with ≥20 mm per face and does not occupy studs or unpenetrated plates.",
  };
}
