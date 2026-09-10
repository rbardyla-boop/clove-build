import type { BuildingComponent, SystemConnection, SystemGraph, SystemNode } from "@/crates/building-graph/types";
import { ELECTRICAL_CONNECTIONS } from "./electrical";
import { HVAC_CONNECTIONS } from "./hvac";
import { PLUMBING_CONNECTIONS } from "./plumbing";

function graphFrom(
  id: string,
  trade: SystemGraph["trade"],
  connections: SystemConnection[],
  components: Record<string, BuildingComponent>,
): SystemGraph {
  const ids = new Set<string>();
  for (const c of connections) {
    ids.add(c.from);
    ids.add(c.to);
  }
  const nodes: SystemNode[] = [];
  for (const nid of ids) {
    const comp = components[nid];
    if (!comp) continue;
    nodes.push({
      id: nid,
      componentId: nid,
      kind: comp.type,
      label: comp.label,
    });
  }
  const live = new Set(nodes.map((n) => n.id));
  return {
    id,
    trade,
    nodes,
    connections: connections.filter((c) => live.has(c.from) && live.has(c.to)),
  };
}

export function buildSystems(components: Record<string, BuildingComponent>): SystemGraph[] {
  return [
    graphFrom("system.plumbing", "plumbing", PLUMBING_CONNECTIONS, components),
    graphFrom("system.electrical", "electrical", ELECTRICAL_CONNECTIONS, components),
    graphFrom("system.hvac", "hvac", HVAC_CONNECTIONS, components),
  ];
}
