import type { BuildingGraph } from "@/crates/building-graph/types";
import { buildPeiHouse } from "./pei-part9-house";
import { buildSlabCottage } from "./slab-cottage";
import { buildRuralPoolHouse } from "./rural-pool";

export type SpecimenChannel = "stable" | "experimental";

export type SpecimenMeta = {
  id: string;
  title: string;
  constructionType: string;
  summary: string;
  channel: SpecimenChannel;
  build: () => BuildingGraph;
};

export const SPECIMENS: SpecimenMeta[] = [
  {
    id: "PEI-PART9-DEMO-001",
    title: "PEI Part 9 house",
    constructionType: "basement",
    summary: "Reference specimen on the v0.3 experimental branch. Public alpha remains v0.2.0.",
    channel: "experimental",
    build: buildPeiHouse,
  },
  {
    id: "PEI-SLAB-COTTAGE-001",
    title: "Slab-on-grade cottage",
    constructionType: "slab-on-grade",
    summary: "Experimental. Envelope openings and visual depth still under human review.",
    channel: "experimental",
    build: buildSlabCottage,
  },
  {
    id: "PEI-RURAL-POOL-001",
    title: "Rural cottage + pool",
    constructionType: "slab-on-grade",
    summary: "Experimental. Pool/hot-tub occupancy is a recorded known defect (POOL-SPA-001).",
    channel: "experimental",
    build: buildRuralPoolHouse,
  },
];

export function buildSpecimen(id: string): BuildingGraph {
  const meta = SPECIMENS.find((s) => s.id === id) ?? SPECIMENS[0];
  return meta.build();
}
