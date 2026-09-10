import type { Attachment, MaterialDescriptor, Relation, SystemGraph, Vec3 } from "@/crates/building-graph/types";
import { linearRun } from "@/crates/geometry/run";
import { addAssembly, addBox, MAT, PROV_EDU, PROV_MODEL, segmentBox } from "../pei-part9-house/helper";
import type { HouseDims } from "./wood-slab";
import type { Registry } from "../pei-part9-house/registry";

const UNKNOWN = { ...PROV_MODEL, status: "not-evaluated" as const, authority: "UNKNOWN" as const };

function runBox(reg: Registry, id: string, label: string, type: "pipe-supply" | "pipe-dwv" | "cable" | "bonding", a: Vec3, b: Vec3, dia: number, material: MaterialDescriptor, trade: "plumbing" | "electrical", tags: string[], short: string, purpose: string, parent: string) {
  const run = linearRun(a, b);
  const { center, size } = segmentBox(run.from, run.to, dia);
  addBox(reg, {
    id,
    type,
    label,
    parentId: parent,
    trade,
    center,
    size,
    material,
    stage: type === "cable" || type === "bonding" ? 17 : 21,
    explodeGroup: parent,
    explodeVector: [0, 0.4, 0.3],
    tags,
    short,
    purpose,
    provenance: type === "bonding" || tags.includes("gfci-unverified") ? UNKNOWN : PROV_EDU,
    system: { systemId: trade === "electrical" ? "system.electrical" : "system.pool", nodeId: id, role: type },
    run,
  });
}

export function addDeckPoolHotTub(reg: Registry, d: HouseDims) {
  const deckZ = d.hW + 1.35;
  const deckY = d.floorTop;
  addAssembly(reg, {
    id: "assembly.deck",
    label: "Wood deck",
    trade: "structure",
    center: [0, 0.3, deckZ],
    size: [5.2, 0.7, 2.5],
    stage: 14,
    explodeVector: [0, 0.45, 0.7],
    short: "A wood deck off the patio door.",
    purpose: "Outdoor living. Guard, stair and lateral load are not verified.",
    tags: ["deck"],
  });
  addBox(reg, {
    id: "deck.ledger",
    type: "beam",
    label: "Deck ledger",
    parentId: "assembly.deck",
    trade: "structure",
    center: [0, deckY - 0.08, d.hW + 0.04],
    size: [4.8, 0.184, 0.038],
    material: MAT.treated,
    stage: 14,
    explodeGroup: "assembly.deck",
    explodeVector: [0, 0.2, 0.3],
    tags: ["deck"],
    short: "Ledger on the front wall.",
    purpose: "Hang the deck joists from the house. Flashing/fasteners are not a design.",
  });
  for (const [id, x] of [["sw", -2.2], ["se", 2.2], ["nw", -2.2], ["ne", 2.2]] as const) {
    const z = id.startsWith("n") ? d.hW + 0.35 : d.hW + 2.35;
    addBox(reg, {
      id: `deck.post.${id}`,
      type: "column",
      label: `Deck post ${id.toUpperCase()}`,
      parentId: "assembly.deck",
      trade: "structure",
      center: [x, 0.1, z],
      size: [0.14, 0.28, 0.14],
      material: MAT.treated,
      stage: 14,
      explodeGroup: "assembly.deck",
      explodeVector: [0, -0.15, 0.4],
      tags: ["deck"],
      short: "A deck post on grade.",
      purpose: "Carry the beam. Footing size is not verified.",
    });
  }
  addBox(reg, {
    id: "deck.beam",
    type: "beam",
    label: "Deck beam",
    parentId: "assembly.deck",
    trade: "structure",
    center: [0, 0.26, d.hW + 2.35],
    size: [4.6, 0.184, 0.14],
    material: MAT.treated,
    stage: 14,
    explodeGroup: "assembly.deck",
    explodeVector: [0, 0.25, 0.5],
    tags: ["deck"],
    short: "Outer deck beam on the posts.",
    purpose: "Carry the joists at the free edge.",
  });
  let j = 0;
  for (let x = -2.2; x <= 2.2 + 1e-9; x += 0.4) {
    addBox(reg, {
      id: `deck.joist.${String(j).padStart(2, "0")}`,
      type: "floor-joist",
      label: `Deck joist ${j}`,
      parentId: "assembly.deck",
      trade: "structure",
      center: [x, 0.34, deckZ],
      size: [0.038, 0.14, 2.3],
      material: MAT.treated,
      stage: 14,
      explodeGroup: "assembly.deck",
      explodeVector: [0, 0.35, 0.45],
      tags: ["deck"],
      short: "A deck joist from ledger to beam.",
      purpose: "Span the deck. Size is demonstration-only.",
    });
    j += 1;
  }
  addBox(reg, {
    id: "deck.platform",
    type: "deck",
    label: "Deck boards",
    parentId: "assembly.deck",
    trade: "structure",
    center: [0, 0.42, deckZ],
    size: [5.0, 0.032, 2.45],
    material: MAT.treated,
    stage: 14,
    explodeGroup: "assembly.deck",
    explodeVector: [0, 0.5, 0.55],
    tags: ["deck"],
    short: "The walking surface of the deck.",
    purpose: "Finish the deck. Guard is not a verified NBC assembly.",
  });

  const poolZ = d.hW + 4.7;
  addAssembly(reg, {
    id: "assembly.recreation",
    label: "Pool and hot tub",
    trade: "plumbing",
    center: [0, 0.2, poolZ],
    size: [9, 1.8, 6],
    stage: 21,
    explodeVector: [0, 0.35, 1.1],
    short: "Outdoor water systems. High-scrutiny specimen.",
    purpose: "Force electrical, plumbing, structure and site to interact. Clearances and bonding are not claimed as CEC-compliant.",
    tags: ["pool"],
  });
  addBox(reg, {
    id: "site.yard.pool",
    type: "site",
    label: "Pool yard grade",
    parentId: "assembly.recreation",
    trade: "foundation",
    center: [0, -0.04, poolZ],
    size: [10, 0.08, 7.2],
    material: MAT.grass,
    stage: 1,
    explodeGroup: "assembly.recreation",
    explodeVector: [0, -0.2, 0],
    tags: ["site"],
    short: "Grade around the pool.",
    purpose: "Site context sized to the recreation area.",
  });
  addBox(reg, {
    id: "pool.001",
    type: "pool",
    label: "In-ground pool shell",
    parentId: "assembly.recreation",
    trade: "plumbing",
    center: [0, -0.45, poolZ],
    size: [6.4, 1.15, 3.2],
    material: MAT.concrete,
    stage: 21,
    explodeGroup: "assembly.recreation",
    explodeVector: [0, -0.3, 0.8],
    tags: ["pool"],
    short: "The pool vessel.",
    purpose: "A water volume boundary. Structural design is not claimed.",
  });
  addBox(reg, {
    id: "pool.water",
    type: "water-volume",
    label: "Pool water",
    parentId: "assembly.recreation",
    trade: "plumbing",
    center: [0, -0.28, poolZ],
    size: [6.05, 0.75, 2.85],
    material: MAT.pvc,
    stage: 21,
    explodeGroup: "assembly.recreation",
    explodeVector: [0, 0.15, 0.8],
    tags: ["pool", "water"],
    short: "The water volume inside the shell.",
    purpose: "So a cable through the vessel is a detectable geometric fact.",
  });
  addBox(reg, {
    id: "pool.coping",
    type: "trim",
    label: "Pool coping",
    parentId: "assembly.recreation",
    trade: "finish",
    center: [0, 0.14, poolZ],
    size: [6.7, 0.04, 3.5],
    material: MAT.concrete,
    stage: 21,
    explodeGroup: "assembly.recreation",
    explodeVector: [0, 0.2, 0.8],
    tags: ["pool"],
    short: "Coping at the pool edge.",
    purpose: "Relate the vessel to surrounding grade.",
  });

  const padX = -4.15;
  const padZ = poolZ;
  addBox(reg, {
    id: "equipment.pad.001",
    type: "equipment-pad",
    label: "Pool equipment pad",
    parentId: "assembly.recreation",
    trade: "structure",
    center: [padX, 0.06, padZ],
    size: [1.5, 0.12, 1.1],
    material: MAT.concrete,
    stage: 16,
    explodeGroup: "assembly.recreation",
    explodeVector: [-0.4, 0.1, 0.5],
    tags: ["pool", "equipment"],
    short: "A concrete pad for pump, filter and heater.",
    purpose: "Equipment sits on something. It does not float.",
  });
  addBox(reg, {
    id: "pool.pump.001",
    type: "pump",
    label: "Pool pump",
    parentId: "assembly.recreation",
    trade: "plumbing",
    center: [padX - 0.4, 0.32, padZ],
    size: [0.38, 0.4, 0.32],
    material: MAT.steel,
    stage: 21,
    explodeGroup: "assembly.recreation",
    explodeVector: [-0.45, 0.25, 0.5],
    tags: ["pool", "equipment"],
    short: "Circulation pump on the pad.",
    purpose: "Move water. Horsepower and listing are unknown.",
  });
  addBox(reg, {
    id: "pool.filter.001",
    type: "filter",
    label: "Pool filter",
    parentId: "assembly.recreation",
    trade: "plumbing",
    center: [padX + 0.05, 0.48, padZ],
    size: [0.42, 0.7, 0.42],
    material: MAT.steel,
    stage: 21,
    explodeGroup: "assembly.recreation",
    explodeVector: [-0.4, 0.3, 0.5],
    tags: ["pool", "equipment"],
    short: "Filter on the pad.",
    purpose: "Clean circulating water. Media is unspecified.",
  });
  addBox(reg, {
    id: "pool.heater.001",
    type: "heat-pump-outdoor",
    label: "Pool heater",
    parentId: "assembly.recreation",
    trade: "hvac",
    center: [padX + 0.5, 0.45, padZ],
    size: [0.55, 0.65, 0.4],
    material: MAT.steel,
    stage: 16,
    explodeGroup: "assembly.recreation",
    explodeVector: [-0.35, 0.25, 0.5],
    tags: ["pool", "equipment"],
    short: "A pool heater on the pad.",
    purpose: "Heat the water. Fuel, clearances and listing are unknown.",
  });

  const suction: Vec3 = [-3.15, -0.55, poolZ];
  const ret: Vec3 = [3.15, -0.25, poolZ];
  runBox(reg, "pool.pipe.suction.001", "Suction line", "pipe-dwv", suction, [padX - 0.4, 0.2, padZ], 0.05, MAT.pvc, "plumbing",
    ["pool", "circulation"], "Suction from the pool wall to the pump.", "Buried then up onto the pad.", "assembly.recreation");
  runBox(reg, "pool.pipe.pump-filter", "Pump to filter", "pipe-supply", [padX - 0.22, 0.35, padZ], [padX - 0.1, 0.35, padZ], 0.04, MAT.pvc, "plumbing",
    ["pool", "circulation"], "Pump discharge into the filter.", "On the pad.", "assembly.recreation");
  runBox(reg, "pool.pipe.filter-heater", "Filter to heater", "pipe-supply", [padX + 0.22, 0.4, padZ], [padX + 0.28, 0.4, padZ], 0.04, MAT.pvc, "plumbing",
    ["pool", "circulation"], "Filtered water to the heater.", "On the pad.", "assembly.recreation");
  runBox(reg, "pool.pipe.return.001", "Return line", "pipe-supply", [padX + 0.7, 0.35, padZ], ret, 0.04, MAT.pvc, "plumbing",
    ["pool", "circulation"], "Heated water returning to the pool.", "Buried return.", "assembly.recreation");
  addBox(reg, {
    id: "penetration.pool.suction",
    type: "penetration",
    label: "Pool suction penetration",
    parentId: "assembly.recreation",
    trade: "plumbing",
    center: suction,
    size: [0.12, 0.12, 0.12],
    material: MAT.concrete,
    stage: 21,
    explodeGroup: "assembly.recreation",
    explodeVector: [-0.3, 0, 0.6],
    tags: ["pool", "penetration"],
    short: "Where suction piping leaves the shell.",
    purpose: "A modelled opening in the vessel.",
    penetration: { hostId: "pool.001", tradeComponentId: "pool.pipe.suction.001", purpose: "suction" },
  });
  addBox(reg, {
    id: "penetration.pool.return",
    type: "penetration",
    label: "Pool return penetration",
    parentId: "assembly.recreation",
    trade: "plumbing",
    center: ret,
    size: [0.1, 0.1, 0.1],
    material: MAT.concrete,
    stage: 21,
    explodeGroup: "assembly.recreation",
    explodeVector: [0.3, 0, 0.6],
    tags: ["pool", "penetration"],
    short: "Where the return enters the shell.",
    purpose: "A modelled opening.",
    penetration: { hostId: "pool.001", tradeComponentId: "pool.pipe.return.001", purpose: "return" },
  });
  addBox(reg, {
    id: "pool.drain.backwash",
    type: "pipe-dwv",
    label: "Backwash to grade (concept)",
    parentId: "assembly.recreation",
    trade: "plumbing",
    center: [padX, -0.15, padZ + 0.7],
    size: [0.04, 0.04, 0.8],
    material: MAT.pvc,
    stage: 21,
    explodeGroup: "assembly.recreation",
    explodeVector: [0, -0.15, 0.6],
    tags: ["pool", "drainage"],
    short: "A schematic backwash discharge.",
    purpose: "Show that filter waste has to go somewhere. Receptor is not designed.",
    run: linearRun([padX, 0.2, padZ + 0.25], [padX, -0.25, padZ + 1.1]),
  });

  addBox(reg, {
    id: "electrical.disconnect.pool",
    type: "disconnect",
    label: "Pool equipment disconnect",
    parentId: "assembly.recreation",
    trade: "electrical",
    center: [padX - 0.7, 1.15, padZ],
    size: [0.08, 0.28, 0.16],
    material: MAT.panel,
    stage: 17,
    explodeGroup: "assembly.recreation",
    explodeVector: [-0.5, 0.3, 0.4],
    tags: ["electrical", "pool"],
    short: "A disconnect at the equipment pad.",
    purpose: "Location relative to water is not a verified CEC 68 measurement.",
    provenance: UNKNOWN,
  });
  runBox(reg, "electrical.cable.pool.feed", "Buried feed to pool disconnect", "cable",
    [-d.hL + 0.08, 0.4, d.hW - 0.4], [padX - 0.7, 0.15, padZ], 0.016, MAT.cable, "electrical",
    ["electrical", "pool", "buried"], "A buried feeder from the cottage toward the pad.", "Depth, conduit and GFCI are not proven.",
    "assembly.recreation");
  runBox(reg, "electrical.cable.pump", "Pump branch", "cable",
    [padX - 0.7, 1.0, padZ], [padX - 0.4, 0.5, padZ], 0.012, MAT.cable, "electrical",
    ["electrical", "pool"], "Disconnect to the pump.", "On the pad.", "assembly.recreation");

  addBox(reg, {
    id: "hottub.001",
    type: "hot-tub",
    label: "Hot tub",
    parentId: "assembly.deck",
    trade: "plumbing",
    center: [1.7, 0.85, d.hW + 1.55],
    size: [1.85, 0.85, 1.85],
    material: MAT.porcelain,
    stage: 21,
    explodeGroup: "assembly.deck",
    explodeVector: [0.3, 0.4, 0.5],
    tags: ["hot-tub"],
    short: "A packaged hot tub on the deck.",
    purpose: "Water + electricity on a structure. Listing and bonding are unknown.",
    provenance: UNKNOWN,
  });
  addBox(reg, {
    id: "hottub.base",
    type: "equipment-pad",
    label: "Hot-tub base",
    parentId: "assembly.deck",
    trade: "structure",
    center: [1.7, 0.45, d.hW + 1.55],
    size: [1.9, 0.05, 1.9],
    material: MAT.treated,
    stage: 14,
    explodeGroup: "assembly.deck",
    explodeVector: [0.3, 0.25, 0.45],
    tags: ["hot-tub"],
    short: "A bearing pad on the deck joists.",
    purpose: "The tub is supported, not hovering.",
  });
  runBox(reg, "electrical.cable.hottub", "Hot-tub feed", "cable",
    [padX - 0.7, 1.0, padZ], [1.7, 0.55, d.hW + 1.55], 0.014, MAT.cable, "electrical",
    ["electrical", "hot-tub"], "A feed from the disconnect toward the hot tub.", "Conductor, GFCI and disconnect distance are MISSING_INFORMATION.",
    "assembly.recreation");
  runBox(reg, "electrical.bonding.pool", "Pool bonding conductor (schematic)", "bonding",
    [padX, 0.15, padZ], [0, -0.9, poolZ], 0.01, MAT.cable, "electrical",
    ["bonding", "pool"], "A schematic equipotential bond to the shell.", "Not a CEC 68 installation. Size and connections unknown.",
    "assembly.recreation");
  runBox(reg, "electrical.bonding.hottub", "Hot-tub bond (schematic)", "bonding",
    [0, -0.9, poolZ], [1.7, 0.45, d.hW + 1.55], 0.01, MAT.cable, "electrical",
    ["bonding", "hot-tub"], "Bond the hot-tub shell into the same schematic grid.", "Not verified.",
    "assembly.recreation");

  for (const [id, c, s] of [
    ["n", [0, 0.6, poolZ + 1.95] as Vec3, [7.2, 1.2, 0.04] as Vec3],
    ["s", [0, 0.6, poolZ - 1.95] as Vec3, [3.4, 1.2, 0.04] as Vec3],
    ["e", [3.4, 0.6, poolZ] as Vec3, [0.04, 1.2, 3.9] as Vec3],
    ["w", [-3.4, 0.6, poolZ] as Vec3, [0.04, 1.2, 3.9] as Vec3],
  ] as const) {
    addBox(reg, {
      id: `pool.barrier.${id}`,
      type: "barrier",
      label: `Pool barrier ${id}`,
      parentId: "assembly.recreation",
      trade: "envelope",
      center: c,
      size: s,
      material: MAT.wood,
      stage: 21,
      explodeGroup: "assembly.recreation",
      explodeVector: [0, 0.4, 0.7],
      tags: ["pool", "barrier"],
      short: "A schematic pool barrier.",
      purpose: "Access/barrier is represented. Height, gates and latches are not verified NBC/PEI predicates.",
      provenance: UNKNOWN,
    });
  }
}

export function recreationSystems(): SystemGraph[] {
  return [
    {
      id: "system.pool",
      trade: "plumbing",
      nodes: [
        { id: "pool.001", componentId: "pool.001", kind: "pool", label: "Pool" },
        { id: "pool.pump.001", componentId: "pool.pump.001", kind: "pump", label: "Pump" },
        { id: "pool.filter.001", componentId: "pool.filter.001", kind: "filter", label: "Filter" },
        { id: "pool.heater.001", componentId: "pool.heater.001", kind: "heat-pump-outdoor", label: "Heater" },
        { id: "pool.pipe.suction.001", componentId: "pool.pipe.suction.001", kind: "pipe-dwv", label: "Suction" },
        { id: "pool.pipe.return.001", componentId: "pool.pipe.return.001", kind: "pipe-supply", label: "Return" },
        { id: "hottub.001", componentId: "hottub.001", kind: "hot-tub", label: "Hot tub" },
      ],
      connections: [
        { id: "pool.suc", from: "pool.001", to: "pool.pipe.suction.001", kind: "suction" },
        { id: "pool.suc2", from: "pool.pipe.suction.001", to: "pool.pump.001", kind: "suction" },
        { id: "pool.pf", from: "pool.pump.001", to: "pool.filter.001", kind: "circulation" },
        { id: "pool.fh", from: "pool.filter.001", to: "pool.heater.001", kind: "circulation" },
        { id: "pool.ret", from: "pool.heater.001", to: "pool.pipe.return.001", kind: "return" },
        { id: "pool.ret2", from: "pool.pipe.return.001", to: "pool.001", kind: "return" },
      ],
    },
  ];
}

export function recreationRelations(): Relation[] {
  return [
    { id: "rel.tub-on-deck", kind: "supported-by", a: "hottub.001", b: "deck.platform", authorityClass: "PROJECT_MODEL_ASSUMPTION" },
    { id: "rel.tub-on-base", kind: "supported-by", a: "hottub.001", b: "hottub.base", authorityClass: "PROJECT_MODEL_ASSUMPTION" },
    { id: "rel.pump-on-pad", kind: "supported-by", a: "pool.pump.001", b: "equipment.pad.001", authorityClass: "PROJECT_MODEL_ASSUMPTION" },
    { id: "rel.filter-on-pad", kind: "supported-by", a: "pool.filter.001", b: "equipment.pad.001", authorityClass: "PROJECT_MODEL_ASSUMPTION" },
    { id: "rel.heater-on-pad", kind: "supported-by", a: "pool.heater.001", b: "equipment.pad.001", authorityClass: "PROJECT_MODEL_ASSUMPTION" },
    { id: "rel.pool-clearance-door", kind: "clearance-between", a: "pool.001", b: "envelope.door.D1", value: 2.4, authorityClass: "PROJECT_MODEL_ASSUMPTION" },
  ];
}

export function recreationAttachments(): Attachment[] {
  return [
    { id: "att.tub-deck", hostId: "deck.platform", attachedId: "hottub.001", kind: "bearing", verified: false, authorityClass: "UNKNOWN" },
    { id: "att.pump-pad", hostId: "equipment.pad.001", attachedId: "pool.pump.001", kind: "bearing", verified: false, authorityClass: "PROJECT_MODEL_ASSUMPTION" },
  ];
}
