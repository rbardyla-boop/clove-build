import type { BuildingGraph } from "@/crates/building-graph/types";
import { buildPeiHouse } from "./pei-part9-house";
import { buildSlabCottage } from "./slab-cottage";
import { buildRuralPoolHouse } from "./rural-pool";

export type SpecimenMeta = {
  id: string;
  title: string;
  constructionType: string;
  summary: string;
  build: () => BuildingGraph;
};

export const SPECIMENS: SpecimenMeta[] = [
  {
    id: "PEI-PART9-DEMO-001",
    title: "PEI Part 9 house",
    constructionType: "basement",
    summary: "Reference specimen. Frozen v0.2 behaviour plus construction-depth fields.",
    build: buildPeiHouse,
  },
  {
    id: "PEI-SLAB-COTTAGE-001",
    title: "Slab-on-grade cottage",
    constructionType: "slab-on-grade",
    summary: "A different dwelling type so the engine cannot memorize one basement house.",
    build: buildSlabCottage,
  },
  {
    id: "PEI-RURAL-POOL-001",
    title: "Rural cottage + pool",
    constructionType: "slab-on-grade",
    summary: "Deck, hot tub and pool. Bonding and water/electrical clearances stay unknown unless proven.",
    build: buildRuralPoolHouse,
  },
];

export function buildSpecimen(id: string): BuildingGraph {
  const meta = SPECIMENS.find((s) => s.id === id) ?? SPECIMENS[0];
  return meta.build();
}
