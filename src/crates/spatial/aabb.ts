import type { BuildingComponent } from "@/crates/building-graph/types";

export type Aabb = {
  min: [number, number, number];
  max: [number, number, number];
};

export function aabb(c: BuildingComponent): Aabb | null {
  if (c.geometry.kind !== "box") return null;
  const [x, y, z] = c.geometry.center;
  const [sx, sy, sz] = c.geometry.size;
  const hx = Math.abs(sx) / 2;
  const hy = Math.abs(sy) / 2;
  const hz = Math.abs(sz) / 2;
  return { min: [x - hx, y - hy, z - hz], max: [x + hx, y + hy, z + hz] };
}

export function overlapVolume(a: Aabb, b: Aabb): number {
  const dx = Math.max(0, Math.min(a.max[0], b.max[0]) - Math.max(a.min[0], b.min[0]));
  const dy = Math.max(0, Math.min(a.max[1], b.max[1]) - Math.max(a.min[1], b.min[1]));
  const dz = Math.max(0, Math.min(a.max[2], b.max[2]) - Math.max(a.min[2], b.min[2]));
  return dx * dy * dz;
}

export function xzClearance(a: Aabb, b: Aabb): number {
  const dx = Math.max(0, Math.max(a.min[0] - b.max[0], b.min[0] - a.max[0]));
  const dz = Math.max(0, Math.max(a.min[2] - b.max[2], b.min[2] - a.max[2]));
  if (dx === 0 && dz === 0) return 0;
  return Math.hypot(dx, dz);
}

export function unionAabb(boxes: Aabb[]): Aabb | null {
  if (!boxes.length) return null;
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  for (const b of boxes) {
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], b.min[i]);
      max[i] = Math.max(max[i], b.max[i]);
    }
  }
  return { min, max };
}

/** Axis of the smallest dimension — the face normal of a sheet or unit. */
export function thinAxis(c: BuildingComponent): 0 | 1 | 2 {
  const [sx, sy, sz] = c.geometry.size.map(Math.abs) as [number, number, number];
  if (sx <= sy && sx <= sz) return 0;
  if (sz <= sx && sz <= sy) return 2;
  return 1;
}

export function rangeOn(box: Aabb, axis: 0 | 1 | 2): [number, number] {
  return [box.min[axis], box.max[axis]];
}

export function contained1d(inner: [number, number], outer: [number, number], pad = 0.04): boolean {
  return inner[0] >= outer[0] - pad && inner[1] <= outer[1] + pad;
}
