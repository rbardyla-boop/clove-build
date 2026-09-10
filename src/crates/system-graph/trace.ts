import type { BuildingGraph, SystemConnection, SystemGraph } from "@/crates/building-graph/types";

export type TraceKind = "plumbing" | "electrical" | "hvac";

function graphOf(building: BuildingGraph, trade: TraceKind): SystemGraph | undefined {
  return building.systems.find((s) => s.trade === trade);
}

function neighbors(sys: SystemGraph, nodeId: string, kinds?: ReadonlySet<string>): string[] {
  const out: string[] = [];
  for (const c of sys.connections) {
    if (kinds && !kinds.has(c.kind)) continue;
    if (c.from === nodeId) out.push(c.to);
    if (c.to === nodeId) out.push(c.from);
  }
  return out;
}

export function nodeIdForComponent(sys: SystemGraph, componentId: string): string | undefined {
  return sys.nodes.find((n) => n.componentId === componentId)?.id;
}

/**
 * Walk an undirected system graph from a component.
 * Removed nodes are treated as cuts. This is topology, not physics.
 */
export function traceFromComponent(
  building: BuildingGraph,
  trade: TraceKind,
  componentId: string,
  removedIds: readonly string[],
  kinds?: readonly string[],
): { nodeIds: string[]; componentIds: string[]; connectionIds: string[] } {
  const sys = graphOf(building, trade);
  if (!sys) return { nodeIds: [], componentIds: [], connectionIds: [] };
  const start = nodeIdForComponent(sys, componentId);
  if (!start) return { nodeIds: [], componentIds: [], connectionIds: [] };
  const removed = new Set(removedIds);
  const kindSet = kinds ? new Set(kinds) : undefined;
  const seen = new Set<string>();
  const stack = [start];
  const connectionIds: string[] = [];
  while (stack.length) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    const node = sys.nodes.find((n) => n.id === id);
    if (!node || removed.has(node.componentId)) continue;
    seen.add(id);
    for (const c of sys.connections) {
      if (kindSet && !kindSet.has(c.kind)) continue;
      if (c.from !== id && c.to !== id) continue;
      const other = c.from === id ? c.to : c.from;
      const otherNode = sys.nodes.find((n) => n.id === other);
      if (!otherNode || removed.has(otherNode.componentId)) continue;
      connectionIds.push(c.id);
      if (!seen.has(other)) stack.push(other);
    }
  }
  const nodeIds = [...seen];
  const componentIds = nodeIds
    .map((id) => sys.nodes.find((n) => n.id === id)?.componentId)
    .filter((id): id is string => Boolean(id));
  return { nodeIds, componentIds, connectionIds: [...new Set(connectionIds)] };
}

export function reachable(
  sys: SystemGraph,
  fromComponentId: string,
  toComponentId: string,
  removedIds: readonly string[],
  kinds?: readonly string[],
): boolean {
  const dummy: BuildingGraph = {
    id: "",
    version: "",
    title: "",
    jurisdictionId: "",
    projectDate: "",
    components: {},
    rootIds: [],
    assemblies: [],
    systems: [sys],
  };
  const walk = traceFromComponent(dummy, sys.trade, fromComponentId, removedIds, kinds);
  return walk.componentIds.includes(toComponentId);
}

export function liveConnections(sys: SystemGraph, removedIds: readonly string[]): SystemConnection[] {
  const removed = new Set(removedIds);
  const liveNodes = new Set(sys.nodes.filter((n) => !removed.has(n.componentId)).map((n) => n.id));
  return sys.connections.filter((c) => liveNodes.has(c.from) && liveNodes.has(c.to));
}
