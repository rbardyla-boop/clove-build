import type { MaterialDescriptor, SystemConnection, Vec3 } from "@/crates/building-graph/types";
import { addAssembly, addBox, MAT, PROV_EDU, segmentBox } from "./helper";
import { P, Y, halfL, halfW } from "./params";
import type { Registry } from "./registry";
import { linearRun } from "@/crates/geometry/run";

const COLD = 0.022;
const HOT = 0.022;
const DWV = 0.075;
const BRANCH = 0.04;
const VENT = 0.04;

function pipe(
  reg: Registry,
  id: string,
  label: string,
  type: "pipe-supply" | "pipe-dwv" | "pipe-vent",
  a: Vec3,
  b: Vec3,
  dia: number,
  material: MaterialDescriptor,
  stage: number,
  tags: string[],
  short: string,
  purpose: string,
  extra?: { explodeGroup?: string; explodeVector?: Vec3; local?: Vec3; parentId?: string },
) {
  const { center, size } = segmentBox(a, b, dia);
  addBox(reg, {
    id,
    type,
    label,
    parentId: extra?.parentId ?? "assembly.plumbing",
    trade: "plumbing",
    center,
    size,
    material,
    stage,
    explodeGroup: extra?.explodeGroup ?? "assembly.plumbing",
    explodeVector: extra?.explodeVector ?? [0, 1.1, 0],
    localExplodeVector: extra?.local ?? [0, 0.35, 0],
    tradeExplodeVector: [0, 1.8, 0],
    tags,
    short,
    purpose,
    visualization: "SCHEMATIC FLOW",
    provenance: PROV_EDU,
    system: { systemId: "system.plumbing", nodeId: id, role: type },
    run: linearRun(a, b),
    dependencies: ["slab.basement", "assembly.wall.bath"],
  });
}

export function addPlumbing(reg: Registry) {
  addAssembly(reg, {
    id: "assembly.plumbing",
    label: "Plumbing system",
    trade: "plumbing",
    center: [-1.2, 1.2, -0.4],
    size: [8, 4.5, 6],
    stage: 15,
    dependencies: ["assembly.wall.bath", "slab.basement"],
    explodeVector: [0, 1.4, 0],
    short: "Residential supply, DWV and vent of this specimen.",
    purpose: "Teach how water arrives, is heated, and leaves — topology, not hydraulic sizing.",
    tags: ["plumbing"],
  });

  const stackX = -2.25;
  const stackZ = -1.35;
  const coldZ = -1.18;
  const hotZ = -1.52;
  const slabY = Y.footingTop + 0.12;
  const fixtureY = Y.floorTop + 0.42;
  const ventY = Y.wallTop + 0.35;
  const roofY = Y.ridgeY + 0.15;
  // Hung below the joists, in the basement, under the subfloor — not through living space.
  const underColdY = Y.sillTop - 0.05;
  const underHotY = Y.sillTop - 0.13;
  const underDwvY = Y.sillTop - 0.07;
  const kitX = 2.75;
  const kitZ = 3.12;
  const kitXHot = 2.68;
  const kitZHot = 3.04;
  const kitSinkY = Y.floorTop + 0.88;
  // W2 is centred at x=2.75, 1.22 m wide (2.14–3.36). Vent the kitchen in the
  // king-stud bay east of that opening — not through the glass.
  const kitVentX = 3.48;
  const kitWallZ = halfW - (P.sheathing + P.stud.d / 2);

  addBox(reg, {
    id: "plumbing.waterheater.001",
    type: "water-heater",
    label: "Electric water heater",
    parentId: "assembly.plumbing",
    trade: "plumbing",
    center: [-1.05, slabY + 0.6, 1.05],
    size: [0.5, 1.2, 0.5],
    material: MAT.steel,
    stage: 15,
    explodeGroup: "assembly.plumbing",
    explodeVector: [0, 0.8, 1.2],
    tradeExplodeVector: [0, 1.2, 0],
    tags: ["plumbing", "mechanical", "hot"],
    short: "An electric storage water heater in the basement mechanical area.",
    purpose: "The hot-water source for this all-electric house. Sizing is not evaluated.",
    visualization: "SCHEMATIC FLOW",
    provenance: PROV_EDU,
    system: { systemId: "system.plumbing", nodeId: "plumbing.waterheater.001", role: "source-hot" },
    dependencies: ["slab.basement"],
  });

  // Cold service through left foundation.
  pipe(reg, "plumbing.supply.cold.service.001", "Cold water service", "pipe-supply",
    [-halfL - 0.2, slabY + 0.35, 1.05], [-halfL + 0.35, slabY + 0.35, 1.05], COLD, MAT.copper, 15,
    ["plumbing", "supply", "cold"], "Incoming cold service through the foundation wall.",
    "Bring potable water into the house. Permit requirements are PEI NPC-adoption context, not encoded as sizing rules.");
  pipe(reg, "plumbing.supply.cold.main.001", "Cold main to water heater", "pipe-supply",
    [-halfL + 0.35, slabY + 0.35, 1.05], [-1.05, slabY + 0.35, 1.05], COLD, MAT.copper, 15,
    ["plumbing", "supply", "cold"], "Cold main in the basement.", "Feed the water heater and cold distribution.");
  pipe(reg, "plumbing.supply.cold.riser.001", "Cold riser", "pipe-supply",
    [-1.05, slabY + 0.35, 1.05], [-1.05, slabY + 0.35, coldZ], COLD, MAT.copper, 15,
    ["plumbing", "supply", "cold"], "Cold run toward the wet wall.", "Carry cold water to the stack wall.");
  pipe(reg, "plumbing.supply.cold.stack.001", "Cold stack in wet wall", "pipe-supply",
    [stackX, slabY + 0.35, coldZ], [stackX, fixtureY + 0.4, coldZ], COLD, MAT.copper, 15,
    ["plumbing", "supply", "cold", "bath"], "Cold riser inside the bathroom wall.", "Serve lavatory, toilet and tub.",
    { explodeGroup: "assembly.wall.bath", explodeVector: [1.6, 0.4, 0], local: [0.45, 0.2, 0], parentId: "assembly.wall.bath" });
  pipe(reg, "plumbing.supply.cold.to-stack.001", "Cold run to wet wall", "pipe-supply",
    [-1.05, slabY + 0.35, coldZ], [stackX, slabY + 0.35, coldZ], COLD, MAT.copper, 15,
    ["plumbing", "supply", "cold"], "Cold turn into the wet wall.", "Arrive at the bathroom stack.");

  pipe(reg, "plumbing.supply.hot.riser.001", "Hot riser from heater", "pipe-supply",
    [-1.05, slabY + 1.15, 1.05], [-1.05, slabY + 1.15, hotZ], HOT, MAT.copper, 15,
    ["plumbing", "supply", "hot"], "Hot water leaving the heater.", "Start of the hot distribution.");
  pipe(reg, "plumbing.supply.hot.stack.001", "Hot stack in wet wall", "pipe-supply",
    [stackX, slabY + 1.15, hotZ], [stackX, fixtureY + 0.55, hotZ], HOT, MAT.copper, 15,
    ["plumbing", "supply", "hot", "bath"], "Hot riser inside the bathroom wall.", "Serve lavatory and tub.",
    { explodeGroup: "assembly.wall.bath", explodeVector: [1.7, 0.45, 0], local: [0.55, 0.25, 0], parentId: "assembly.wall.bath" });
  pipe(reg, "plumbing.supply.hot.to-stack.001", "Hot run to wet wall", "pipe-supply",
    [-1.05, slabY + 1.15, hotZ], [stackX, slabY + 1.15, hotZ], HOT, MAT.copper, 15,
    ["plumbing", "supply", "hot"], "Hot turn into the wet wall.", "Arrive at the bathroom hot stack.");

  // Fixtures
  addBox(reg, {
    id: "plumbing.fixture.toilet.bath",
    type: "fixture",
    label: "Bathroom toilet",
    parentId: "assembly.plumbing",
    trade: "plumbing",
    center: [-3.55, Y.floorTop + 0.2, -2.15],
    size: [0.38, 0.4, 0.52],
    material: MAT.porcelain,
    stage: 21,
    explodeGroup: "assembly.wall.bath",
    explodeVector: [-0.8, 0.3, -0.4],
    localExplodeVector: [-0.55, 0.1, 0],
    tradeExplodeVector: [0, 1.5, 0],
    tags: ["plumbing", "fixture", "bath"],
    short: "A floor-mounted toilet.",
    purpose: "A soil fixture on the wet wall. Trap is modelled separately.",
    visualization: "SCHEMATIC FLOW",
    provenance: PROV_EDU,
    system: { systemId: "system.plumbing", nodeId: "plumbing.fixture.toilet.bath", role: "fixture" },
    dependencies: ["plumbing.dwv.branch.toilet.001"],
  });
  addBox(reg, {
    id: "plumbing.fixture.sink.bath",
    type: "fixture",
    label: "Bathroom lavatory",
    parentId: "assembly.plumbing",
    trade: "plumbing",
    center: [-3.55, Y.floorTop + 0.78, -0.75],
    size: [0.5, 0.16, 0.4],
    material: MAT.porcelain,
    stage: 21,
    explodeGroup: "assembly.wall.bath",
    explodeVector: [-0.8, 0.4, 0],
    localExplodeVector: [-0.5, 0.15, 0],
    tradeExplodeVector: [0, 1.5, 0],
    tags: ["plumbing", "fixture", "bath"],
    short: "Bathroom lavatory.",
    purpose: "A waste fixture with a trap on the wet wall.",
    visualization: "SCHEMATIC FLOW",
    provenance: PROV_EDU,
    system: { systemId: "system.plumbing", nodeId: "plumbing.fixture.sink.bath", role: "fixture" },
    dependencies: ["plumbing.dwv.trap.lav.001"],
  });
  addBox(reg, {
    id: "plumbing.fixture.tub.bath",
    type: "fixture",
    label: "Bathtub",
    parentId: "assembly.plumbing",
    trade: "plumbing",
    center: [-3.35, Y.floorTop + 0.28, 0.55],
    size: [0.75, 0.45, 1.5],
    material: MAT.porcelain,
    stage: 21,
    explodeGroup: "assembly.wall.bath",
    explodeVector: [-0.9, 0.2, 0.4],
    tradeExplodeVector: [0, 1.4, 0],
    tags: ["plumbing", "fixture", "bath"],
    short: "A bathtub on the bathroom wet wall.",
    purpose: "The bathing fixture of this specimen.",
    visualization: "SCHEMATIC FLOW",
    provenance: PROV_EDU,
    system: { systemId: "system.plumbing", nodeId: "plumbing.fixture.tub.bath", role: "fixture" },
    dependencies: ["plumbing.dwv.trap.tub.001"],
  });
  addBox(reg, {
    id: "plumbing.fixture.sink.kitchen",
    type: "fixture",
    label: "Kitchen sink",
    parentId: "assembly.plumbing",
    trade: "plumbing",
    center: [2.75, Y.floorTop + 0.88, 3.15],
    size: [0.7, 0.18, 0.45],
    material: MAT.steel,
    stage: 21,
    explodeGroup: "assembly.wall.front",
    explodeVector: [0, 0.4, 1.8],
    localExplodeVector: [0, 0.2, 0.55],
    tradeExplodeVector: [0, 1.6, 0],
    tags: ["plumbing", "fixture", "kitchen"],
    short: "Kitchen sink in the cabinet / occupied space.",
    purpose: "A kitchen waste fixture. The bowl lives in occupied space; only stub-outs belong in the wall.",
    visualization: "SCHEMATIC FLOW",
    provenance: PROV_EDU,
    system: { systemId: "system.plumbing", nodeId: "plumbing.fixture.sink.kitchen", role: "fixture" },
    dependencies: ["plumbing.dwv.trap.kitchen.001"],
  });

  // Traps
  addBox(reg, {
    id: "plumbing.dwv.trap.lav.001",
    type: "trap",
    label: "Lavatory trap",
    parentId: "assembly.plumbing",
    trade: "plumbing",
    center: [-3.2, Y.floorTop + 0.55, -0.75],
    size: [0.12, 0.18, 0.12],
    material: MAT.abs,
    stage: 15,
    explodeGroup: "assembly.wall.bath",
    explodeVector: [1.3, 0.2, 0],
    localExplodeVector: [0.4, 0.1, 0],
    tags: ["plumbing", "dwv", "bath", "fixture-trap"],
    short: "P-trap under the lavatory.",
    purpose: "Hold a water seal on the lavatory waste. This is an educational topology object, not an NPC clause.",
    visualization: "SCHEMATIC FLOW",
    provenance: PROV_EDU,
    system: { systemId: "system.plumbing", nodeId: "plumbing.dwv.trap.lav.001", role: "trap" },
  });
  addBox(reg, {
    id: "plumbing.dwv.trap.tub.001",
    type: "trap",
    label: "Tub trap",
    parentId: "assembly.plumbing",
    trade: "plumbing",
    center: [-2.85, Y.floorTop + 0.12, 0.55],
    size: [0.14, 0.16, 0.14],
    material: MAT.abs,
    stage: 15,
    explodeGroup: "assembly.wall.bath",
    explodeVector: [1.2, 0.15, 0.2],
    tags: ["plumbing", "dwv", "bath"],
    short: "Trap on the bathtub waste.",
    purpose: "Hold a water seal on the tub waste.",
    visualization: "SCHEMATIC FLOW",
    provenance: PROV_EDU,
    system: { systemId: "system.plumbing", nodeId: "plumbing.dwv.trap.tub.001", role: "trap" },
  });
  addBox(reg, {
    id: "plumbing.dwv.trap.kitchen.001",
    type: "trap",
    label: "Kitchen sink trap",
    parentId: "assembly.plumbing",
    trade: "plumbing",
    center: [2.75, Y.floorTop + 0.58, 3.05],
    size: [0.12, 0.18, 0.12],
    material: MAT.abs,
    stage: 15,
    explodeGroup: "assembly.wall.front",
    explodeVector: [0, 0.3, 1.6],
    localExplodeVector: [0, 0.15, 0.45],
    tags: ["plumbing", "dwv", "kitchen", "cabinet-trap"],
    short: "P-trap under the kitchen sink.",
    purpose: "Hold a water seal on the kitchen waste.",
    visualization: "SCHEMATIC FLOW",
    provenance: PROV_EDU,
    system: { systemId: "system.plumbing", nodeId: "plumbing.dwv.trap.kitchen.001", role: "trap" },
  });

  // DWV stack and branches
  pipe(reg, "plumbing.dwv.stack.001", "Soil/waste stack", "pipe-dwv",
    [stackX, slabY, stackZ], [stackX, ventY, stackZ], DWV, MAT.abs, 15,
    ["plumbing", "dwv", "stack", "bath"], "The vertical soil and waste stack in the wet wall.",
    "Collect fixture wastes and continue as a vent. Routing is this specimen's topology.",
    { explodeGroup: "assembly.wall.bath", explodeVector: [1.8, 0.3, 0], local: [0.65, 0, 0], parentId: "assembly.wall.bath" });
  pipe(reg, "plumbing.dwv.branch.toilet.drop", "Toilet drain drop", "pipe-dwv",
    [-3.55, Y.floorTop + 0.05, -2.15], [-3.55, underDwvY, -2.15], BRANCH, MAT.abs, 15,
    ["plumbing", "dwv", "bath"], "Toilet waste dropping through the floor.",
    "Leave the fixture through the floor, then travel under the joists.");
  pipe(reg, "plumbing.dwv.branch.toilet.001", "Toilet drain branch", "pipe-dwv",
    [-3.55, underDwvY, -2.15], [stackX, underDwvY, stackZ], BRANCH, MAT.abs, 15,
    ["plumbing", "dwv", "bath"], "Toilet waste hung under the joists.", "Connect the soil fixture to the stack below the floor.");
  pipe(reg, "plumbing.dwv.branch.lav.001", "Lavatory drain branch", "pipe-dwv",
    [-3.2, Y.floorTop + 0.4, -0.75], [stackX, Y.floorTop + 0.4, stackZ], BRANCH, MAT.abs, 15,
    ["plumbing", "dwv", "bath"], "Lavatory waste to the stack.", "Connect the lavatory trap to the stack.",
    { explodeGroup: "assembly.wall.bath", explodeVector: [1.4, 0.2, 0], local: [0.4, 0, 0], parentId: "assembly.wall.bath" });
  pipe(reg, "plumbing.dwv.branch.tub.drop", "Tub drain drop", "pipe-dwv",
    [-2.85, Y.floorTop + 0.05, 0.55], [-2.85, underDwvY, 0.55], BRANCH, MAT.abs, 15,
    ["plumbing", "dwv", "bath"], "Tub waste dropping through the floor.",
    "Leave the tub through the floor, then travel under the joists.");
  pipe(reg, "plumbing.dwv.branch.tub.001", "Tub drain branch", "pipe-dwv",
    [-2.85, underDwvY, 0.55], [stackX, underDwvY, stackZ], BRANCH, MAT.abs, 15,
    ["plumbing", "dwv", "bath"], "Tub waste hung under the joists.", "Connect the tub trap to the stack below the floor.");
  pipe(reg, "plumbing.dwv.branch.kitchen.drop", "Kitchen drain drop through floor", "pipe-dwv",
    [2.75, Y.floorTop + 0.5, 3.05], [2.75, underDwvY, 3.05], BRANCH, MAT.abs, 15,
    ["plumbing", "dwv", "kitchen"], "Kitchen waste dropping through the subfloor at the sink.",
    "Leave the cabinet through the floor, then travel under the joists.");
  pipe(reg, "plumbing.dwv.branch.kitchen.001", "Kitchen drain branch", "pipe-dwv",
    [2.75, underDwvY, 3.05], [stackX, underDwvY, 3.05], BRANCH, MAT.abs, 15,
    ["plumbing", "dwv", "kitchen"], "Kitchen waste hung under the joists, not bored through them.",
    "Carry kitchen waste below the floor structure to the stack wall.");
  pipe(reg, "plumbing.dwv.branch.kitchen.002", "Kitchen drain to stack", "pipe-dwv",
    [stackX, underDwvY, 3.05], [stackX, underDwvY, stackZ], BRANCH, MAT.abs, 15,
    ["plumbing", "dwv", "kitchen"], "Kitchen waste turning along the wet wall under the floor.",
    "Join kitchen waste to the stack from below the joists.");

  pipe(reg, "plumbing.dwv.building-drain.001", "Building drain", "pipe-dwv",
    [stackX, slabY, stackZ], [-halfL - 0.35, slabY, stackZ], DWV, MAT.abs, 15,
    ["plumbing", "dwv", "exit"], "Building drain leaving through the foundation.",
    "Carry waste out of the house. This is topology, not a sewer design.");

  addBox(reg, {
    id: "penetration.foundation.left.plumbing.002",
    type: "penetration",
    label: "Cold water service penetration",
    parentId: "assembly.foundation",
    trade: "plumbing",
    center: [-halfL, slabY + 0.35, 1.05],
    size: [P.fdnT + 0.04, 0.08, 0.08],
    material: MAT.concrete,
    stage: 15,
    explodeGroup: "assembly.foundation",
    explodeVector: [-1.3, 0, 0],
    tags: ["plumbing", "penetration", "foundation"],
    short: "Opening where the cold service enters the foundation.",
    purpose: "Host/trade penetration for the water service.",
    penetration: { hostId: "fdn.left", tradeComponentId: "plumbing.supply.cold.service.001", purpose: "water-service" },
    dependencies: ["plumbing.supply.cold.service.001"],
  });
  addBox(reg, {
    id: "penetration.foundation.left.plumbing.001",
    type: "penetration",
    label: "Building drain foundation penetration",
    parentId: "assembly.foundation",
    trade: "plumbing",
    center: [-halfL, slabY, stackZ],
    size: [P.fdnT + 0.04, 0.14, 0.14],
    material: MAT.concrete,
    stage: 15,
    explodeGroup: "assembly.foundation",
    explodeVector: [-1.4, 0, 0],
    tags: ["plumbing", "penetration", "foundation"],
    short: "A modelled opening where the building drain leaves the foundation.",
    purpose: "Make the penetration a first-class component so later air-sealing and firestopping can attach.",
    penetration: { hostId: "assembly.foundation", tradeComponentId: "plumbing.dwv.building-drain.001", purpose: "building-drain-exit" },
    dependencies: ["plumbing.dwv.building-drain.001"],
  });
  addBox(reg, {
    id: "penetration.wall.bath.plumbing.003",
    type: "penetration",
    label: "Stack plate penetration",
    parentId: "assembly.wall.bath",
    trade: "plumbing",
    center: [stackX, Y.floorTop, stackZ],
    size: [0.12, 0.08, 0.12],
    material: MAT.wood,
    stage: 15,
    explodeGroup: "assembly.wall.bath",
    explodeVector: [1.5, 0.1, 0],
    tags: ["plumbing", "penetration", "bath"],
    short: "Opening where the stack passes the floor plate.",
    purpose: "Record the host/trade relationship of a service penetration.",
    penetration: { hostId: "assembly.wall.bath.plate.bottom", tradeComponentId: "plumbing.dwv.stack.001", purpose: "dwv-stack" },
    dependencies: ["plumbing.dwv.stack.001"],
  });
  addBox(reg, {
    id: "penetration.wall.bath.plumbing.004",
    type: "penetration",
    label: "Stack top-plate penetration",
    parentId: "assembly.wall.bath",
    trade: "plumbing",
    center: [stackX, Y.wallTop - P.plate, stackZ],
    size: [0.12, 0.1, 0.12],
    material: MAT.wood,
    stage: 15,
    explodeGroup: "assembly.wall.bath",
    explodeVector: [1.5, 0.4, 0],
    tags: ["plumbing", "penetration", "bath"],
    short: "Opening where the stack passes the wet-wall top plate.",
    purpose: "The stack continues through the double top plate into the attic/vent. That opening is a modelled host/trade pair.",
    penetration: { hostId: "assembly.wall.bath.plate.top", tradeComponentId: "plumbing.dwv.stack.001", purpose: "dwv-stack" },
    dependencies: ["plumbing.dwv.stack.001"],
  });

  // Vents — kitchen vent rises at the fixture wall, then crosses in the attic, not through the room.
  pipe(reg, "plumbing.vent.stack.001", "Stack vent through roof", "pipe-vent",
    [stackX, ventY, stackZ], [stackX, roofY, stackZ], VENT, MAT.pvc, 15,
    ["plumbing", "vent"], "Stack vent terminating above the roof.",
    "Relieve the DWV system. Termination clearances are not encoded as NPC text.",
    { explodeGroup: "assembly.roof", explodeVector: [0, 2.2, 0], local: [0, 0.6, 0] });
  addBox(reg, {
    id: "penetration.roof.plumbing.001",
    type: "penetration",
    label: "Stack vent roof penetration",
    parentId: "assembly.roof",
    trade: "plumbing",
    center: [stackX, Y.ridgeY - 0.15, stackZ],
    size: [0.1, 0.2, 0.1],
    material: MAT.osb,
    stage: 15,
    explodeGroup: "assembly.roof",
    explodeVector: [0, 2.4, 0],
    tags: ["plumbing", "penetration", "roof"],
    short: "Opening where the stack vent passes the roof deck.",
    purpose: "Host/trade penetration at the roof. Flashing details are simplified.",
    penetration: { hostId: "roof.sheathing.s.1", tradeComponentId: "plumbing.vent.stack.001", purpose: "stack-vent" },
    dependencies: ["plumbing.vent.stack.001"],
  });
  pipe(reg, "plumbing.vent.lav.001", "Lavatory vent", "pipe-vent",
    [stackX, fixtureY + 0.55, -0.75], [stackX, fixtureY + 0.55, stackZ], VENT, MAT.pvc, 15,
    ["plumbing", "vent", "bath"], "Dry vent from the lavatory.", "Connect the lavatory to the vent system.",
    { explodeGroup: "assembly.wall.bath", explodeVector: [1.5, 0.5, 0], local: [0.5, 0.2, 0], parentId: "assembly.wall.bath" });
  pipe(reg, "plumbing.vent.kitchen.arm", "Kitchen vent cabinet arm", "pipe-vent",
    [kitX, Y.floorTop + 0.62, 3.05], [kitVentX, Y.floorTop + 0.62, 3.05], VENT, MAT.pvc, 15,
    ["plumbing", "vent", "kitchen"], "Short vent arm in the kitchen cabinet, under the window sill.",
    "Move off the window centreline before entering the wall.",
    { explodeGroup: "assembly.wall.front", explodeVector: [0, 0.4, 1.5], local: [0, 0.15, 0.4], parentId: "assembly.wall.front" });
  pipe(reg, "plumbing.vent.kitchen.into-wall", "Kitchen vent into wall", "pipe-vent",
    [kitVentX, Y.floorTop + 0.62, 3.05], [kitVentX, Y.floorTop + 0.62, kitWallZ], VENT, MAT.pvc, 15,
    ["plumbing", "vent", "kitchen"], "Turn from the cabinet into the front-wall cavity beside W2.",
    "Enter the framed wall in a stud bay, not the window unit.",
    { explodeGroup: "assembly.wall.front", explodeVector: [0, 0.45, 1.6], local: [0, 0.15, 0.42], parentId: "assembly.wall.front" });
  pipe(reg, "plumbing.vent.kitchen.rise", "Kitchen vent riser", "pipe-vent",
    [kitVentX, Y.floorTop + 0.62, kitWallZ], [kitVentX, ventY, kitWallZ], VENT, MAT.pvc, 15,
    ["plumbing", "vent", "kitchen"], "Kitchen vent rising in the service wall beside the window.",
    "Take the kitchen trap to the attic/ceiling plane inside the wall cavity.",
    { explodeGroup: "assembly.wall.front", explodeVector: [0, 0.5, 1.7], local: [0, 0.2, 0.45], parentId: "assembly.wall.front" });
  pipe(reg, "plumbing.vent.kitchen.001", "Kitchen vent through attic", "pipe-vent",
    [kitVentX, ventY, kitWallZ], [stackX, ventY, kitWallZ], VENT, MAT.pvc, 15,
    ["plumbing", "vent", "kitchen"], "Kitchen vent crossing above the ceiling to the stack.",
    "Keep the kitchen trap from siphoning — educational topology in the attic, not occupied space.");
  pipe(reg, "plumbing.vent.kitchen.002", "Kitchen vent to stack", "pipe-vent",
    [stackX, ventY, kitWallZ], [stackX, ventY, stackZ], VENT, MAT.pvc, 15,
    ["plumbing", "vent", "kitchen"], "Kitchen vent joining the stack vent above the ceiling.",
    "Tie kitchen venting into the main stack in the attic plane.");

  // Kitchen supply hung below the joists, then rising through the floor at the fixture.
  pipe(reg, "plumbing.supply.cold.kitchen.001", "Cold to kitchen under floor", "pipe-supply",
    [stackX, underColdY, coldZ], [kitX, underColdY, coldZ], COLD, MAT.pex, 15,
    ["plumbing", "supply", "cold", "kitchen"], "Cold distribution hung under the joists.",
    "Serve the kitchen without crossing occupied living space.");
  pipe(reg, "plumbing.supply.cold.kitchen.002", "Cold kitchen run to fixture", "pipe-supply",
    [kitX, underColdY, coldZ], [kitX, underColdY, kitZ], COLD, MAT.pex, 15,
    ["plumbing", "supply", "cold", "kitchen"], "Cold turn under the kitchen toward the sink.",
    "Arrive under the fixture before rising.");
  pipe(reg, "plumbing.supply.cold.kitchen.003", "Cold kitchen rise", "pipe-supply",
    [kitX, underColdY, kitZ], [kitX, kitSinkY, kitZ], COLD, MAT.pex, 15,
    ["plumbing", "supply", "cold", "kitchen"], "Cold rise through the floor at the kitchen sink.",
    "The only above-floor kitchen supply is the fixture riser.",
    { explodeGroup: "assembly.wall.front", explodeVector: [0, 0.35, 1.6], local: [0, 0.15, 0.4], parentId: "assembly.wall.front" });
  pipe(reg, "plumbing.supply.hot.kitchen.001", "Hot to kitchen under floor", "pipe-supply",
    [stackX, underHotY, hotZ], [kitXHot, underHotY, hotZ], HOT, MAT.pex, 15,
    ["plumbing", "supply", "hot", "kitchen"], "Hot distribution hung under the joists.",
    "Serve the kitchen without crossing occupied living space.");
  pipe(reg, "plumbing.supply.hot.kitchen.002", "Hot kitchen run to fixture", "pipe-supply",
    [kitXHot, underHotY, hotZ], [kitXHot, underHotY, kitZHot], HOT, MAT.pex, 15,
    ["plumbing", "supply", "hot", "kitchen"], "Hot turn under the kitchen toward the sink.",
    "Arrive under the fixture before rising.");
  pipe(reg, "plumbing.supply.hot.kitchen.003", "Hot kitchen rise", "pipe-supply",
    [kitXHot, underHotY, kitZHot], [kitXHot, kitSinkY - 0.06, kitZHot], HOT, MAT.pex, 15,
    ["plumbing", "supply", "hot", "kitchen"], "Hot rise through the floor at the kitchen sink.",
    "The only above-floor kitchen hot supply is the fixture riser.",
    { explodeGroup: "assembly.wall.front", explodeVector: [0, 0.35, 1.65], local: [0, 0.15, 0.42], parentId: "assembly.wall.front" });

  addBox(reg, {
    id: "penetration.floor.plumbing.cold.kitchen",
    type: "penetration",
    label: "Kitchen cold-supply floor penetration",
    parentId: "assembly.floor",
    trade: "plumbing",
    center: [kitX, Y.floorTop, kitZ],
    size: [0.06, 0.05, 0.06],
    material: MAT.wood,
    stage: 15,
    explodeGroup: "assembly.floor",
    explodeVector: [0, 0.7, 0],
    tags: ["plumbing", "penetration", "kitchen"],
    short: "Opening where cold supply rises through the subfloor at the kitchen.",
    purpose: "Host/trade penetration so the kitchen rise is an intended opening, not a clash.",
    penetration: { hostId: "subfloor.5", tradeComponentId: "plumbing.supply.cold.kitchen.003", purpose: "kitchen-cold-riser" },
    dependencies: ["plumbing.supply.cold.kitchen.003"],
  });
  addBox(reg, {
    id: "penetration.floor.plumbing.hot.kitchen",
    type: "penetration",
    label: "Kitchen hot-supply floor penetration",
    parentId: "assembly.floor",
    trade: "plumbing",
    center: [kitXHot, Y.floorTop, kitZHot],
    size: [0.06, 0.05, 0.06],
    material: MAT.wood,
    stage: 15,
    explodeGroup: "assembly.floor",
    explodeVector: [0, 0.7, 0],
    tags: ["plumbing", "penetration", "kitchen"],
    short: "Opening where hot supply rises through the subfloor at the kitchen.",
    purpose: "Host/trade penetration for the kitchen hot riser.",
    penetration: { hostId: "subfloor.5", tradeComponentId: "plumbing.supply.hot.kitchen.003", purpose: "kitchen-hot-riser" },
    dependencies: ["plumbing.supply.hot.kitchen.003"],
  });
  addBox(reg, {
    id: "penetration.floor.plumbing.dwv.kitchen",
    type: "penetration",
    label: "Kitchen drain floor penetration",
    parentId: "assembly.floor",
    trade: "plumbing",
    center: [2.75, Y.floorTop, 3.05],
    size: [0.08, 0.05, 0.08],
    material: MAT.wood,
    stage: 15,
    explodeGroup: "assembly.floor",
    explodeVector: [0, 0.7, 0],
    tags: ["plumbing", "penetration", "kitchen"],
    short: "Opening where the kitchen drain drops through the subfloor.",
    purpose: "Host/trade penetration so the kitchen waste drop is an intended opening.",
    penetration: { hostId: "subfloor.5", tradeComponentId: "plumbing.dwv.branch.kitchen.drop", purpose: "kitchen-dwv-drop" },
    dependencies: ["plumbing.dwv.branch.kitchen.drop"],
  });
}

export const PLUMBING_CONNECTIONS: SystemConnection[] = [
  { id: "pl.cold.svc", from: "plumbing.supply.cold.service.001", to: "plumbing.supply.cold.main.001", kind: "cold" },
  { id: "pl.cold.wh", from: "plumbing.supply.cold.main.001", to: "plumbing.waterheater.001", kind: "cold" },
  { id: "pl.cold.riser", from: "plumbing.supply.cold.main.001", to: "plumbing.supply.cold.riser.001", kind: "cold" },
  { id: "pl.cold.to-stack", from: "plumbing.supply.cold.riser.001", to: "plumbing.supply.cold.to-stack.001", kind: "cold" },
  { id: "pl.cold.stack", from: "plumbing.supply.cold.to-stack.001", to: "plumbing.supply.cold.stack.001", kind: "cold" },
  { id: "pl.cold.toilet", from: "plumbing.supply.cold.stack.001", to: "plumbing.fixture.toilet.bath", kind: "cold" },
  { id: "pl.cold.lav", from: "plumbing.supply.cold.stack.001", to: "plumbing.fixture.sink.bath", kind: "cold" },
  { id: "pl.cold.tub", from: "plumbing.supply.cold.stack.001", to: "plumbing.fixture.tub.bath", kind: "cold" },
  { id: "pl.cold.kit1", from: "plumbing.supply.cold.stack.001", to: "plumbing.supply.cold.kitchen.001", kind: "cold" },
  { id: "pl.cold.kit2", from: "plumbing.supply.cold.kitchen.001", to: "plumbing.supply.cold.kitchen.002", kind: "cold" },
  { id: "pl.cold.kit3", from: "plumbing.supply.cold.kitchen.002", to: "plumbing.supply.cold.kitchen.003", kind: "cold" },
  { id: "pl.cold.kit4", from: "plumbing.supply.cold.kitchen.003", to: "plumbing.fixture.sink.kitchen", kind: "cold" },
  { id: "pl.hot.riser", from: "plumbing.waterheater.001", to: "plumbing.supply.hot.riser.001", kind: "hot" },
  { id: "pl.hot.to-stack", from: "plumbing.supply.hot.riser.001", to: "plumbing.supply.hot.to-stack.001", kind: "hot" },
  { id: "pl.hot.stack", from: "plumbing.supply.hot.to-stack.001", to: "plumbing.supply.hot.stack.001", kind: "hot" },
  { id: "pl.hot.lav", from: "plumbing.supply.hot.stack.001", to: "plumbing.fixture.sink.bath", kind: "hot" },
  { id: "pl.hot.tub", from: "plumbing.supply.hot.stack.001", to: "plumbing.fixture.tub.bath", kind: "hot" },
  { id: "pl.hot.kit1", from: "plumbing.supply.hot.stack.001", to: "plumbing.supply.hot.kitchen.001", kind: "hot" },
  { id: "pl.hot.kit2", from: "plumbing.supply.hot.kitchen.001", to: "plumbing.supply.hot.kitchen.002", kind: "hot" },
  { id: "pl.hot.kit3", from: "plumbing.supply.hot.kitchen.002", to: "plumbing.supply.hot.kitchen.003", kind: "hot" },
  { id: "pl.hot.kit4", from: "plumbing.supply.hot.kitchen.003", to: "plumbing.fixture.sink.kitchen", kind: "hot" },
  { id: "pl.dwv.toilet", from: "plumbing.fixture.toilet.bath", to: "plumbing.dwv.branch.toilet.drop", kind: "drain" },
  { id: "pl.dwv.toilet1b", from: "plumbing.dwv.branch.toilet.drop", to: "plumbing.dwv.branch.toilet.001", kind: "drain" },
  { id: "pl.dwv.toilet2", from: "plumbing.dwv.branch.toilet.001", to: "plumbing.dwv.stack.001", kind: "drain" },
  { id: "pl.dwv.lav1", from: "plumbing.fixture.sink.bath", to: "plumbing.dwv.trap.lav.001", kind: "drain" },
  { id: "pl.dwv.lav2", from: "plumbing.dwv.trap.lav.001", to: "plumbing.dwv.branch.lav.001", kind: "drain" },
  { id: "pl.dwv.lav3", from: "plumbing.dwv.branch.lav.001", to: "plumbing.dwv.stack.001", kind: "drain" },
  { id: "pl.dwv.tub1", from: "plumbing.fixture.tub.bath", to: "plumbing.dwv.trap.tub.001", kind: "drain" },
  { id: "pl.dwv.tub1b", from: "plumbing.dwv.trap.tub.001", to: "plumbing.dwv.branch.tub.drop", kind: "drain" },
  { id: "pl.dwv.tub2", from: "plumbing.dwv.branch.tub.drop", to: "plumbing.dwv.branch.tub.001", kind: "drain" },
  { id: "pl.dwv.tub3", from: "plumbing.dwv.branch.tub.001", to: "plumbing.dwv.stack.001", kind: "drain" },
  { id: "pl.dwv.kit1", from: "plumbing.fixture.sink.kitchen", to: "plumbing.dwv.trap.kitchen.001", kind: "drain" },
  { id: "pl.dwv.kit1b", from: "plumbing.dwv.trap.kitchen.001", to: "plumbing.dwv.branch.kitchen.drop", kind: "drain" },
  { id: "pl.dwv.kit2", from: "plumbing.dwv.branch.kitchen.drop", to: "plumbing.dwv.branch.kitchen.001", kind: "drain" },
  { id: "pl.dwv.kit3", from: "plumbing.dwv.branch.kitchen.001", to: "plumbing.dwv.branch.kitchen.002", kind: "drain" },
  { id: "pl.dwv.kit4", from: "plumbing.dwv.branch.kitchen.002", to: "plumbing.dwv.stack.001", kind: "drain" },
  { id: "pl.dwv.exit", from: "plumbing.dwv.stack.001", to: "plumbing.dwv.building-drain.001", kind: "drain" },
  { id: "pl.vent.stack", from: "plumbing.dwv.stack.001", to: "plumbing.vent.stack.001", kind: "vent" },
  { id: "pl.vent.lav", from: "plumbing.dwv.trap.lav.001", to: "plumbing.vent.lav.001", kind: "vent" },
  { id: "pl.vent.lav2", from: "plumbing.vent.lav.001", to: "plumbing.vent.stack.001", kind: "vent" },
  { id: "pl.vent.kit", from: "plumbing.dwv.trap.kitchen.001", to: "plumbing.vent.kitchen.arm", kind: "vent" },
  { id: "pl.vent.kit1b", from: "plumbing.vent.kitchen.arm", to: "plumbing.vent.kitchen.into-wall", kind: "vent" },
  { id: "pl.vent.kit1c", from: "plumbing.vent.kitchen.into-wall", to: "plumbing.vent.kitchen.rise", kind: "vent" },
  { id: "pl.vent.kit2", from: "plumbing.vent.kitchen.rise", to: "plumbing.vent.kitchen.001", kind: "vent" },
  { id: "pl.vent.kit3", from: "plumbing.vent.kitchen.001", to: "plumbing.vent.kitchen.002", kind: "vent" },
  { id: "pl.vent.kit4", from: "plumbing.vent.kitchen.002", to: "plumbing.vent.stack.001", kind: "vent" },
];
