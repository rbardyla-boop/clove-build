import type { BuildingGraph, SiteFacts } from "@/crates/building-graph/types";

function aabb(c: { geometry: { center: [number, number, number]; size: [number, number, number]; rotation?: unknown; kind: string } }) {
  if (c.geometry.rotation) return null;
  const [x, y, z] = c.geometry.center;
  const [sx, sy, sz] = c.geometry.size;
  return {
    min: [x - sx / 2, y - sy / 2, z - sz / 2] as [number, number, number],
    max: [x + sx / 2, y + sy / 2, z + sz / 2] as [number, number, number],
  };
}

/**
 * Envelope facts from the graph. Never import specimen P/Y into engines.
 */
export function siteFacts(graph: BuildingGraph): SiteFacts {
  if (graph.site) return graph.site;
  const comps = Object.values(graph.components);
  const floors = comps.filter((c) => c.type === "subfloor" || c.type === "slab");
  const plates = comps.filter((c) => c.type === "top-plate");
  const sills = comps.filter((c) => c.type === "sill-plate");
  const joists = comps.filter((c) => c.type === "floor-joist");
  const ridge = comps.find((c) => c.type === "ridge");
  const grade = comps.find((c) => c.type === "site");
  let xMin = Infinity,
    xMax = -Infinity,
    zMin = Infinity,
    zMax = -Infinity,
    floorTop = -Infinity,
    wallTop = -Infinity,
    sillTop = -Infinity;
  for (const f of floors) {
    const b = aabb(f);
    if (!b) continue;
    xMin = Math.min(xMin, b.min[0]);
    xMax = Math.max(xMax, b.max[0]);
    zMin = Math.min(zMin, b.min[2]);
    zMax = Math.max(zMax, b.max[2]);
    floorTop = Math.max(floorTop, b.max[1]);
  }
  for (const p of plates) {
    const b = aabb(p);
    if (!b) continue;
    wallTop = Math.max(wallTop, b.max[1]);
  }
  for (const s of sills) {
    const b = aabb(s);
    if (!b) continue;
    sillTop = Math.max(sillTop, b.max[1]);
  }
  const joistDepth = joists[0]?.geometry.size[1] ?? 0.235;
  if (!Number.isFinite(sillTop)) sillTop = floorTop - joistDepth;
  if (!Number.isFinite(floorTop)) floorTop = 0.3;
  if (!Number.isFinite(wallTop)) wallTop = floorTop + 2.5;
  if (!Number.isFinite(xMin)) {
    xMin = -4;
    xMax = 4;
    zMin = -3;
    zMax = 3;
  }
  const hasBasement = comps.some((c) => c.type === "foundation-wall");
  const hasSlabOnly = comps.some((c) => c.type === "slab") && !hasBasement;
  return {
    constructionType: hasSlabOnly ? "slab-on-grade" : hasBasement ? "basement" : "crawlspace",
    xMin,
    xMax,
    zMin,
    zMax,
    floorTop,
    wallTop,
    sillTop,
    grade: grade ? grade.geometry.center[1] : 0,
    ridgeY: ridge ? ridge.geometry.center[1] : wallTop + 1.8,
    joistDepth,
  };
}

export function deriveSite(graph: BuildingGraph): BuildingGraph {
  return { ...graph, site: siteFacts(graph) };
}
