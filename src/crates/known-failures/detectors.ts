import type { BuildingGraph } from "@/crates/building-graph/types";
import { findSpatialIssues, type SpatialIssue } from "@/crates/spatial/awareness";

export type KnownFinding = {
  id: string;
  failureId: string;
  a: string;
  b: string;
  reason: string;
};

function toFinding(issue: SpatialIssue, failureId: string): KnownFinding {
  return { id: issue.id, failureId, a: issue.a, b: issue.b, reason: issue.reason };
}

export function findEnvelopeOpeningIssues(graph: BuildingGraph): KnownFinding[] {
  return findSpatialIssues(graph)
    .filter((i) => i.kind === "SHEET_COVERS_OPENING")
    .map((i) => toFinding(i, "ENVELOPE-OPENING-001"));
}

export function findPoolSpaIssues(graph: BuildingGraph): KnownFinding[] {
  return findSpatialIssues(graph)
    .filter((i) => i.kind === "VESSEL_CLEARANCE")
    .map((i) => toFinding(i, "POOL-SPA-001"));
}

export function findKnownDefects(graph: BuildingGraph): KnownFinding[] {
  return [...findEnvelopeOpeningIssues(graph), ...findPoolSpaIssues(graph)];
}
