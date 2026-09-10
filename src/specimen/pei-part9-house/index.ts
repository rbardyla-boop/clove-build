import type { BuildingGraph } from "@/crates/building-graph/types";
import { addFloor } from "./floor";
import { addFoundation } from "./foundation";
import { PROJECT_DATE, SPECIMEN_ID, SPECIMEN_VERSION } from "./params";
import { createRegistry } from "./registry";
import { addRoof } from "./roof";
import { addWalls } from "./walls";

let cached: BuildingGraph | null = null;

export function buildPeiHouse(): BuildingGraph {
  if (cached) return cached;
  const reg = createRegistry();
  addFoundation(reg);
  addFloor(reg);
  addWalls(reg);
  addRoof(reg);

  const assemblies = Object.values(reg.components)
    .filter((c) => c.type === "assembly")
    .map((c) => c.id);

  const graph: BuildingGraph = {
    id: SPECIMEN_ID,
    version: SPECIMEN_VERSION,
    title: "PEI Part 9 demonstration house",
    jurisdictionId: "ca-pei",
    projectDate: PROJECT_DATE,
    components: reg.components,
    rootIds: assemblies,
    assemblies,
  };
  cached = Object.freeze(graph) as BuildingGraph;
  return cached;
}

export function cloneBaselineGraph(): BuildingGraph {
  return buildPeiHouse();
}

export { PROJECT_DATE, SPECIMEN_ID, SPECIMEN_VERSION } from "./params";
export { P, Y } from "./params";
