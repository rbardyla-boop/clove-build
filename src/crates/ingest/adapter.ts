import { checkGraphIntegrity } from "@/crates/building-graph/integrity";
import type { BuildingGraph } from "@/crates/building-graph/types";

/**
 * Proposed graph from an untrusted plan (PDF, drawing, IFC, etc.).
 * Not canonical until acceptCandidate runs integrity.
 * v1 never calls ingest; the PEI specimen is already a BuildingGraph.
 */
export type PlanSourceKind = "specimen" | "ifc" | "pdf" | "drawing" | "unknown";

export type BuildingGraphCandidate = {
  graph: BuildingGraph;
  sourceKind: PlanSourceKind;
  sourceId?: string;
  notes?: string[];
};

export interface PlanIngestAdapter {
  ingest(input: unknown): Promise<BuildingGraphCandidate>;
}

/**
 * Integrity gate between intake and the live engine.
 * Ingest must not write LabSnapshot.graph directly.
 */
export function acceptCandidate(candidate: BuildingGraphCandidate): BuildingGraph {
  const issues = checkGraphIntegrity(candidate.graph);
  if (issues.length > 0) {
    const detail = issues.map((i) => i.code).join(", ");
    throw new Error(`BuildingGraphCandidate failed integrity: ${detail}`);
  }
  return candidate.graph;
}

export const futurePlanIngestAdapter: PlanIngestAdapter = {
  async ingest() {
    throw new Error("PlanIngestAdapter is not implemented in v1. Use the PEI specimen.");
  },
};
