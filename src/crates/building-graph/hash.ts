import type { BuildingGraph } from "./types";

/** Deterministic FNV-1a over stable component fields. */
export function hashGraph(graph: BuildingGraph): string {
  const ids = Object.keys(graph.components).sort();
  let h = 2166136261;
  mix(graph.id);
  mix(graph.version);
  for (const id of ids) {
    const c = graph.components[id];
    mix(id);
    mix(c.type);
    mix(c.geometry.kind);
    mix(c.geometry.center.map(q).join(","));
    mix(c.geometry.size.map(q).join(","));
    mix(String(c.assembly.stage));
    mix(c.assembly.explodeGroup);
  }
  return (h >>> 0).toString(16).padStart(8, "0");

  function mix(s: string) {
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  }
}

function q(n: number): string {
  return n.toFixed(5);
}

export function hashRemoved(removedIds: readonly string[]): string {
  return [...removedIds].sort().join("|");
}
