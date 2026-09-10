import type { BuildingComponent, BuildingGraph } from "@/crates/building-graph/types";
import { aabb, contained1d, overlapVolume, rangeOn, thinAxis, unionAabb, xzClearance } from "./aabb";
import { isEnvelopeFaceSheet, isOpening, vesselFamily } from "./occupancy";

export type SpatialIssueKind = "SHEET_COVERS_OPENING" | "VESSEL_CLEARANCE";

export type SpatialIssue = {
  id: string;
  kind: SpatialIssueKind;
  a: string;
  b: string;
  reason: string;
};

function wallKey(c: BuildingComponent): string | null {
  const fromParent = c.parentId?.match(/assembly\.wall\.([a-z]+)/);
  if (fromParent) return fromParent[1];
  const tag = c.tags?.find((t) => t === "front" || t === "back" || t === "left" || t === "right");
  return tag ?? null;
}

/**
 * A sheet covers an opening when the opening's face rectangle sits inside the
 * sheet's face rectangle on the same wall. Outboard offset does not excuse it —
 * cladding 20 mm outside the unit still occupies the hole unless it is cut.
 */
export function findSheetCoveringOpenings(graph: BuildingGraph): SpatialIssue[] {
  const comps = Object.values(graph.components);
  const sheets = comps.filter(isEnvelopeFaceSheet);
  const openings = comps.filter(isOpening);
  const out: SpatialIssue[] = [];
  for (const sheet of sheets) {
    const sa = aabb(sheet);
    if (!sa) continue;
    const wall = wallKey(sheet);
    const n = thinAxis(sheet);
    const u = n === 0 ? 2 : 0;
    const v = 1;
    for (const opening of openings) {
      if (wall && wallKey(opening) && wallKey(opening) !== wall) continue;
      const oa = aabb(opening);
      if (!oa) continue;
      const planeGap = Math.abs(opening.geometry.center[n] - sheet.geometry.center[n]);
      if (planeGap > 0.45) continue;
      if (!contained1d(rangeOn(oa, u), rangeOn(sa, u))) continue;
      if (!contained1d(rangeOn(oa, v), rangeOn(sa, v))) continue;
      out.push({
        id: `sheet-open.${sheet.id}.${opening.id}`,
        kind: "SHEET_COVERS_OPENING",
        a: sheet.id,
        b: opening.id,
        reason: `${sheet.label} occupies the ${opening.label} opening instead of being cut around the framed hole.`,
      });
    }
  }
  return out;
}

/**
 * Distinct vessel families (pool vs spa) must not share volume and must have
 * a modelled plan clearance. The 0.70 m figure is a spatial-occupancy teaching
 * threshold, not a CEC/NBC clearance.
 */
const VESSEL_PLAN_CLEAR_M = 0.7;

export function findVesselClearanceIssues(graph: BuildingGraph): SpatialIssue[] {
  const comps = Object.values(graph.components);
  const poolBoxes = [];
  const spaBoxes = [];
  const poolIds: string[] = [];
  const spaIds: string[] = [];
  for (const c of comps) {
    const fam = vesselFamily(c);
    const box = aabb(c);
    if (!fam || !box) continue;
    if (fam === "spa") {
      spaBoxes.push(box);
      spaIds.push(c.id);
    } else {
      poolBoxes.push(box);
      poolIds.push(c.id);
    }
  }
  const pool = unionAabb(poolBoxes);
  const spa = unionAabb(spaBoxes);
  if (!pool || !spa) return [];
  const vol = overlapVolume(pool, spa);
  const clear = xzClearance(pool, spa);
  if (vol <= 1e-5 && clear >= VESSEL_PLAN_CLEAR_M) return [];
  const a = spaIds[0] ?? "hottub.001";
  const b = poolIds[0] ?? "pool.001";
  return [
    {
      id: `vessel.${a}.${b}`,
      kind: "VESSEL_CLEARANCE",
      a,
      b,
      reason:
        vol > 1e-5
          ? `Hot tub and pool occupy overlapping volume (${vol.toFixed(4)} m³).`
          : `Hot tub and pool are ${clear.toFixed(2)} m apart in plan — they read as one colliding water feature.`,
    },
  ];
}

export function findSpatialIssues(graph: BuildingGraph): SpatialIssue[] {
  return [...findSheetCoveringOpenings(graph), ...findVesselClearanceIssues(graph)];
}
