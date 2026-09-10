import type { BuildingGraph } from "@/crates/building-graph/types";
import { isStageVisible } from "@/crates/construction-sequence/visibility";

export type SequenceFinding = {
  id: string;
  kind: "MISSING_PREREQUISITE" | "CONCEALED_BEFORE_ROUGH";
  a: string;
  b: string;
  reason: string;
};

const CONCEALING = new Set(["drywall", "paint", "floor-finish", "cladding", "roof-covering"]);
const ROUGH = new Set(["pipe-supply", "pipe-dwv", "pipe-vent", "cable", "duct"]);

/**
 * Project-model sequence. Not a legal construction schedule.
 */
export function findSequenceViolations(
  graph: BuildingGraph,
  constructionStage: number,
  removedIds: readonly string[] = [],
): SequenceFinding[] {
  const removed = new Set(removedIds);
  const out: SequenceFinding[] = [];
  for (const c of Object.values(graph.components)) {
    if (removed.has(c.id)) continue;
    if (!isStageVisible(c, constructionStage, removed)) continue;
    for (const depId of c.assembly.dependencies) {
      const dep = graph.components[depId];
      if (!dep) {
        out.push({
          id: `seq.missing.${c.id}.${depId}`,
          kind: "MISSING_PREREQUISITE",
          a: c.id,
          b: depId,
          reason: `${c.label} lists prerequisite ${depId}, which is not in the graph.`,
        });
        continue;
      }
      if (removed.has(dep.id)) {
        out.push({
          id: `seq.removed.${c.id}.${dep.id}`,
          kind: "MISSING_PREREQUISITE",
          a: c.id,
          b: dep.id,
          reason: `${c.label} cannot happen yet: ${dep.label} is missing.`,
        });
        continue;
      }
      const depPlaced = dep.geometry.kind === "group" || isStageVisible(dep, constructionStage, removed);
      if (!depPlaced) {
        out.push({
          id: `seq.order.${c.id}.${dep.id}`,
          kind: "MISSING_PREREQUISITE",
          a: c.id,
          b: dep.id,
          reason: `${c.label} cannot happen yet: ${dep.label} is not in place at this stage.`,
        });
      }
    }
  }
  const finishVisible = Object.values(graph.components).some(
    (c) => CONCEALING.has(c.type) && isStageVisible(c, constructionStage, removed) && !removed.has(c.id),
  );
  if (finishVisible) {
    for (const c of Object.values(graph.components)) {
      if (!ROUGH.has(c.type) || removed.has(c.id)) continue;
      if (!isStageVisible(c, constructionStage, removed)) {
        out.push({
          id: `seq.conceal.${c.id}`,
          kind: "CONCEALED_BEFORE_ROUGH",
          a: c.id,
          b: "finish",
          reason: `Finish is visible while ${c.label} is not yet in the sequence — services would be concealed before they exist.`,
        });
      }
    }
  }
  return out;
}

export function whyNotYet(graph: BuildingGraph, id: string, constructionStage: number, removedIds: readonly string[] = []): string[] {
  const c = graph.components[id];
  if (!c) return ["That member is not in the graph."];
  return findSequenceViolations(graph, constructionStage, removedIds)
    .filter((f) => f.a === id)
    .map((f) => f.reason);
}
