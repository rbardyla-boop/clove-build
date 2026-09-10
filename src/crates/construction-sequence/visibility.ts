import type { BuildingComponent, BuildingGraph } from "@/crates/building-graph/types";
import { STAGE_MAX } from "./stages";

export function isStageVisible(
  component: BuildingComponent,
  stage: number,
  removedIds: ReadonlySet<string>,
): boolean {
  if (component.geometry.kind === "group") return false;
  if (removedIds.has(component.id)) return false;
  if (component.assembly.stage > stage) return false;
  if (component.assembly.untilStage != null && stage > component.assembly.untilStage) return false;
  return true;
}

export function visibleIds(
  graph: BuildingGraph,
  stage: number,
  removedIds: ReadonlySet<string>,
): string[] {
  const ids: string[] = [];
  for (const c of Object.values(graph.components)) {
    if (isStageVisible(c, stage, removedIds)) ids.push(c.id);
  }
  return ids;
}

export function completeStage(): number {
  return STAGE_MAX;
}
