import type { BuildingComponent, BuildingGraph } from "@/crates/building-graph/types";
import { CONSTRUCTION_STAGES } from "@/crates/construction-sequence/stages";
import { formatMetres, formatSize } from "@/crates/geometry/format";

export function parentLabel(graph: BuildingGraph, c: BuildingComponent): string {
  if (!c.parentId) return "—";
  return graph.components[c.parentId]?.label ?? c.parentId;
}

export function stageName(stage: number): string {
  return CONSTRUCTION_STAGES.find((s) => s.id === stage)?.label ?? `Stage ${stage}`;
}

export function dimLines(c: BuildingComponent): { metric: string; imperial: string; both: string } {
  const [x, y, z] = c.geometry.size;
  return {
    metric: [x, y, z].map((v) => formatMetres(v).metric).join(" × "),
    imperial: [x, y, z].map((v) => formatMetres(v).imperial).join(" × "),
    both: formatSize(c.geometry.size),
  };
}

export function authorityLabel(c: BuildingComponent): string {
  switch (c.provenance.authority) {
    case "OFFICIAL_REGULATION":
      return "Official regulation";
    case "OFFICIAL_GUIDANCE":
      return "Official guidance";
    case "STANDARD_REFERENCE":
      return "Standard reference";
    case "VERIFIED_ENGINEERING_RELATION":
      return "Verified engineering relation";
    case "PROJECT_MODEL_ASSUMPTION":
      return "Project model assumption";
    case "EDUCATIONAL_DEMO_RULE":
      return "Educational demonstration";
    case "INFERENCE":
      return "Inference";
    default:
      return "Unknown";
  }
}
