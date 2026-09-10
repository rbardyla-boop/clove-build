import type { BuildingGraph } from "@/crates/building-graph/types";
import { Y } from "@/specimen/pei-part9-house/params";

export const FAULT_MIDROOM = "fault.midroom-pipe";

/**
 * Overlay faults. Never written into the canonical graph.
 * RESET drops them. Hash of the planned graph is unchanged.
 */
export function graphWithFaults(graph: BuildingGraph, faultIds: readonly string[]): BuildingGraph {
  if (!faultIds.length) return graph;
  if (!faultIds.includes(FAULT_MIDROOM)) return graph;
  const template = graph.components["plumbing.supply.cold.kitchen.001"];
  if (!template) return graph;
  return {
    ...graph,
    components: {
      ...graph.components,
      [FAULT_MIDROOM]: {
        ...template,
        id: FAULT_MIDROOM,
        label: "Demo: supply through the room",
        parentId: "assembly.plumbing",
        geometry: { kind: "box", center: [0, Y.floorTop + 0.7, 0.2], size: [4.4, 0.022, 0.022] },
        assembly: { ...template.assembly, explodeGroup: "assembly.plumbing" },
        tags: ["plumbing", "supply", "cold", "demo-fault"],
        learning: {
          shortDescription: "An injected occupied-space routing fault for the error finder.",
          purpose: "Teach CROSS-ROUTE-001. Not part of the planned house.",
          claimCategory: "educational-simplification",
        },
      },
    },
  };
}
