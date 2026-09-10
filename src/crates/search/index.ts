import type { BuildingComponent, BuildingGraph } from "@/crates/building-graph/types";
import { tradeOf } from "@/crates/trades/infer";

export type SearchHit = {
  id: string;
  label: string;
  score: number;
  reason: string;
};

function tokens(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((t) => t.length >= 2);
}

function haystack(c: BuildingComponent): string {
  return [
    c.id,
    c.label,
    c.type,
    c.trade ?? "",
    c.material.label,
    ...(c.tags ?? []),
    c.learning.shortDescription,
    c.learning.purpose,
    c.system?.role ?? "",
    c.penetration?.purpose ?? "",
    c.structural?.loadPathRole ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

/**
 * Semantic search over the building graph, not mesh names.
 */
export function searchComponents(graph: BuildingGraph, query: string, limit = 12): SearchHit[] {
  const q = query.trim();
  if (q.length < 2) return [];
  const parts = tokens(q);
  if (parts.length === 0) return [];
  const hits: SearchHit[] = [];
  for (const c of Object.values(graph.components)) {
    if (c.geometry.kind === "group" && c.type === "assembly") {
      /* assemblies are searchable */
    }
    const hay = haystack(c);
    let score = 0;
    for (const p of parts) {
      if (c.id.toLowerCase() === p) score += 8;
      if (c.label.toLowerCase() === q.toLowerCase()) score += 7;
      if (c.type.replace(/-/g, " ").includes(p) || c.type.includes(p)) score += 4;
      if ((c.tags ?? []).some((t) => t.toLowerCase() === p)) score += 3;
      if (c.label.toLowerCase().includes(p)) score += 3;
      if (c.id.toLowerCase().includes(p)) score += 2;
      if (hay.includes(p)) score += 1;
      if (tradeOf(c) === p) score += 2;
    }
    if (score <= 0) continue;
    hits.push({
      id: c.id,
      label: c.label,
      score,
      reason: `${c.type} · ${tradeOf(c)}`,
    });
  }
  hits.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
  return hits.slice(0, limit);
}
