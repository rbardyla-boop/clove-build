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
    summary: "Compact slab-on-grade cottage. Drains in the granular base, supply in walls and attic.",
    build: buildSlabCottage,
  },
  {
    id: "PEI-RURAL-POOL-001",
    title: "Rural cottage + pool",
    constructionType: "slab-on-grade",
    summary: "Slab cottage plus deck, in-ground pool, hot tub, circulation and schematic bonding. CEC 68 stays unknown.",
    build: buildRuralPoolHouse,
  },
];

export function buildSpecimen(id: string): BuildingGraph {
  const meta = SPECIMENS.find((s) => s.id === id) ?? SPECIMENS[0];
  return meta.build();
}
