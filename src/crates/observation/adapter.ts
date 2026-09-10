import type { BuildingGraph } from "@/crates/building-graph/types";

/**
 * Jobsite capture and evidence. Unimplemented in v1.
 *
 * Reconstruction produces geometry, not a BuildingGraph.
 * Semantic identity (which stud, which header) comes from aligning
 * an ObservedScene to the planned graph, then recording EvidenceRecord.
 *
 * Evidence is evidence-bounded: the system must know when it cannot
 * see or prove something. There is no "AI accurate" status.
 */

export const EVIDENCE_STATUSES = [
  "DIRECTLY_OBSERVED",
  "MEASURED",
  "AI_INFERRED",
  "PLAN_ASSUMED",
  "OCCLUDED",
  "CONFLICTING",
  "UNKNOWN",
] as const;

export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];

export type EvidenceRecord = {
  sourceId: string;
  timestamp: string;
  componentId?: string;
  status: EvidenceStatus;
  confidence?: number;
};

export type ObservedBuildingState = {
  plannedGraph: BuildingGraph;
  observations: EvidenceRecord[];
};

export type CaptureKind = "photo" | "video" | "pano-360" | "lidar" | "unknown";

export type CaptureAsset = {
  id: string;
  kind: CaptureKind;
  timestamp: string;
};

export type CaptureSet = {
  id: string;
  assets: CaptureAsset[];
  capturedAt?: string;
};

/** Geometry and poses only. Not a semantic building graph. */
export type ObservedScene = {
  id: string;
  captureSetId: string;
  reconstructedAt: string;
};

export interface RealityCaptureAdapter {
  reconstruct(input: CaptureSet): Promise<ObservedScene>;
}

/** v1 path: a planned house with no site evidence. */
export function plannedOnly(graph: BuildingGraph): ObservedBuildingState {
  return { plannedGraph: graph, observations: [] };
}

export const futureRealityCaptureAdapter: RealityCaptureAdapter = {
  async reconstruct() {
    throw new Error("RealityCaptureAdapter is not implemented in v1.");
  },
};
