import type { BuildingGraph } from "@/crates/building-graph/types";
import { addFloor } from "./floor";
import { addFoundation } from "./foundation";
import { PROJECT_DATE, SPECIMEN_ID, SPECIMEN_VERSION } from "./params";
import { createRegistry } from "./registry";
import { addRoof } from "./roof";
import { addWalls } from "./walls";
import { addInterior } from "./interior";
import { addEnvelope } from "./envelope";
import { addPlumbing } from "./plumbing";
import { addElectrical } from "./electrical";
import { addHvac } from "./hvac";
import { addThermal } from "./thermal";
import { addFinish } from "./finish";
import { buildSystems } from "./systems";

let cached: BuildingGraph | null = null;

export function buildPeiHouse(): BuildingGraph {
  if (cached) return cached;
  const reg = createRegistry();
  addFoundation(reg);
  addFloor(reg);
  addWalls(reg);
  addRoof(reg);
  addInterior(reg);
  addEnvelope(reg);
  addPlumbing(reg);
  addElectrical(reg);
  addHvac(reg);
  addThermal(reg);
  addFinish(reg);

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
    systems: buildSystems(reg.components),
  };
  cached = Object.freeze(graph) as BuildingGraph;
  return cached;
}

export function cloneBaselineGraph(): BuildingGraph {
  return buildPeiHouse();
}

export { PROJECT_DATE, SPECIMEN_ID, SPECIMEN_VERSION } from "./params";
export { P, Y } from "./params";
