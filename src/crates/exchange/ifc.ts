import type { BuildingGraph } from "@/crates/building-graph/types";
import type { BuildingGraphCandidate } from "@/crates/ingest/adapter";

/**
 * Future IFC / openBIM round-trip of a canonical BuildingGraph.
 *
 * Third-party IFC, PDF, or drawing intake belongs on PlanIngestAdapter
 * (returns BuildingGraphCandidate, then acceptCandidate / integrity).
 * This adapter must not become a second ingest path that writes a graph
 * straight into the session.
 *
 * v0.1 does not import or export IFC. Do not claim IFC support
 * until a real model has been round-tripped and tested.
 */
export interface BuildingExchangeAdapter {
  import?(data: ArrayBuffer): Promise<BuildingGraphCandidate>;
  export?(graph: BuildingGraph): Promise<ArrayBuffer>;
}

export const futureIfcAdapter: BuildingExchangeAdapter = {};
