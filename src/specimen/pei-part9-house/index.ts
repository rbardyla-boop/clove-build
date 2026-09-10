import type { Attachment, BuildingGraph, Relation } from "@/crates/building-graph/types";
import { siteFacts } from "@/crates/site/facts";
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

function peiRelations(): Relation[] {
  return [
    {
      id: "rel.stack-in-wetwall",
      kind: "contained-in",
      a: "plumbing.dwv.stack.001",
      b: "assembly.wall.bath",
      authorityClass: "PROJECT_MODEL_ASSUMPTION",
    },
    {
      id: "rel.sill-on-foundation",
      kind: "supported-by",
      a: "sill.front",
      b: "fdn.front",
      authorityClass: "PROJECT_MODEL_ASSUMPTION",
    },
    {
      id: "rel.header-on-jack",
      kind: "supported-by",
      a: "assembly.wall.front.header.W1",
      b: "assembly.wall.front.jack.W1.L",
      authorityClass: "PROJECT_MODEL_ASSUMPTION",
    },
    {
      id: "rel.boot-aligned-riser",
      kind: "aligned-with",
      a: "hvac.terminal.front.001",
      b: "hvac.duct.supply.front.rise",
      axis: 0,
      authorityClass: "PROJECT_MODEL_ASSUMPTION",
    },
    {
      id: "rel.kit-drop-at-sink",
      kind: "aligned-with",
      a: "plumbing.dwv.branch.kitchen.drop",
      b: "plumbing.fixture.sink.kitchen",
      axis: 0,
      authorityClass: "PROJECT_MODEL_ASSUMPTION",
    },
    {
      id: "rel.pen-centred-kit",
      kind: "centred-in",
      a: "penetration.floor.plumbing.dwv.kitchen",
      b: "plumbing.dwv.branch.kitchen.drop",
      authorityClass: "PROJECT_MODEL_ASSUMPTION",
    },
    {
      id: "rel.rafter-on-wall",
      kind: "above",
      a: "roof.ridge",
      b: "assembly.wall.front",
      authorityClass: "PROJECT_MODEL_ASSUMPTION",
    },
  ];
}

function peiAttachments(): Attachment[] {
  return [
    {
      id: "att.sill-anchor",
      hostId: "fdn.front",
      attachedId: "sill.front",
      kind: "anchor-bolt",
      count: 4,
      verified: false,
      authorityClass: "UNKNOWN",
    },
    {
      id: "att.hvac-hanger",
      hostId: "hvac.duct.supply.main",
      attachedId: "hvac.hanger.supply.001",
      kind: "duct-strap",
      count: 1,
      verified: false,
      authorityClass: "UNKNOWN",
    },
  ];
}

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

  const draft: BuildingGraph = {
    id: SPECIMEN_ID,
    version: SPECIMEN_VERSION,
    title: "PEI Part 9 demonstration house",
    jurisdictionId: "ca-pei",
    projectDate: PROJECT_DATE,
    components: reg.components,
    rootIds: assemblies,
    assemblies,
    systems: buildSystems(reg.components),
    relations: peiRelations().filter((r) => reg.components[r.a] && reg.components[r.b]),
    attachments: peiAttachments().filter((a) => reg.components[a.hostId] && reg.components[a.attachedId]),
  };
  draft.site = siteFacts(draft);
  cached = Object.freeze(draft) as BuildingGraph;
  return cached;
}

export function cloneBaselineGraph(): BuildingGraph {
  return buildPeiHouse();
}

export { PROJECT_DATE, SPECIMEN_ID, SPECIMEN_VERSION } from "./params";
export { P, Y } from "./params";
