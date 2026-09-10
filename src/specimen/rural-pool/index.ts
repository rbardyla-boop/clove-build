import type { BuildingGraph, Relation, Vec3 } from "@/crates/building-graph/types";
import { siteFacts } from "@/crates/site/facts";
import { addBox, addAssembly, MAT, PROV_MODEL, segmentBox } from "../pei-part9-house/helper";
import { createRegistry } from "../pei-part9-house/registry";

const L = 8.0;
const W = 7.0;
const hL = L / 2;
const hW = W / 2;
const floorTop = 0.18;
const wallTop = 2.62;

function box(
  reg: ReturnType<typeof createRegistry>,
  id: string,
  type: Parameters<typeof addBox>[1]["type"],
  label: string,
  trade: Parameters<typeof addBox>[1]["trade"],
  c: Vec3,
  s: Vec3,
  stage: number,
  parent: string,
  extra: Partial<Parameters<typeof addBox>[1]> = {},
) {
  addBox(reg, {
    id,
    type,
    label,
    parentId: parent,
    trade,
    center: c,
    size: s,
    material: extra.material ?? MAT.wood,
    stage,
    explodeGroup: extra.explodeGroup ?? parent,
    explodeVector: extra.explodeVector ?? [0, 0.35, 0],
    tags: extra.tags,
    short: extra.short ?? label,
    purpose: extra.purpose ?? "Rural recreational specimen. Safety distances are not verified CEC/NBC determinations.",
    provenance: extra.provenance ?? { ...PROV_MODEL, status: "not-evaluated", authority: "UNKNOWN" },
    system: extra.system,
    run: extra.run,
    dependencies: extra.dependencies,
  });
}

export function buildRuralPoolHouse(): BuildingGraph {
  const reg = createRegistry();
  addAssembly(reg, {
    id: "assembly.foundation",
    label: "Cottage slab",
    trade: "foundation",
    center: [0, 0.12, 0],
    size: [L + 1, 0.4, W + 1],
    stage: 4,
    explodeVector: [0, -0.5, 0],
    short: "Slab under a recreational cottage.",
    purpose: "Carry the cottage. Not a geotechnical design.",
  });
  box(reg, "site.grade", "site", "Grade", "foundation", [0, -0.04, 2], [28, 0.08, 24], 1, "assembly.foundation", { material: MAT.grass });
  box(reg, "slab.grade", "slab", "Cottage slab", "foundation", [0, 0.12, 0], [L + 0.4, 0.24, W + 0.4], 4, "assembly.foundation", { material: MAT.concrete });

  addAssembly(reg, {
    id: "assembly.walls",
    label: "Cottage walls",
    trade: "structure",
    center: [0, 1.4, 0],
    size: [L, 2.5, W],
    stage: 8,
    explodeVector: [0, 0, 0],
    short: "Wood walls of the cottage.",
    purpose: "Enclose the dwelling.",
  });
  box(reg, "assembly.wall.front.plate.bottom", "bottom-plate", "Front plate", "structure", [0, floorTop + 0.02, hW - 0.07], [L, 0.038, 0.14], 8, "assembly.walls");
  box(reg, "assembly.wall.front.plate.top", "top-plate", "Front top plate", "structure", [0, wallTop - 0.02, hW - 0.07], [L, 0.038, 0.14], 8, "assembly.walls");
  for (let i = 0; i < 12; i++) {
    const x = -hL + 0.3 + i * 0.64;
    box(reg, `assembly.wall.front.stud.${String(i).padStart(2, "0")}`, "common-stud", "Stud", "structure", [x, 1.4, hW - 0.07], [0.038, 2.35, 0.14], 8, "assembly.walls");
  }
  box(reg, "envelope.door.front", "door-unit", "Patio door", "envelope", [0, 1.15, hW], [1.6, 2.05, 0.1], 13, "assembly.walls");

  addAssembly(reg, {
    id: "assembly.roof",
    label: "Cottage roof",
    trade: "structure",
    center: [0, 3.3, 0],
    size: [L + 0.6, 1.4, W + 0.8],
    stage: 11,
    explodeVector: [0, 1, 0],
    short: "Gable roof.",
    purpose: "Close the cottage.",
  });
  box(reg, "roof.ridge", "ridge", "Ridge", "structure", [0, 3.55, 0], [L + 0.2, 0.235, 0.038], 11, "assembly.roof");
  box(reg, "roof.covering.s", "roof-covering", "Shingles", "envelope", [0, 3.15, 1.6], [L + 0.4, 0.012, 4.2], 14, "assembly.roof", { material: MAT.shingle });

  addAssembly(reg, {
    id: "assembly.deck",
    label: "Deck",
    trade: "structure",
    center: [0, 0.35, hW + 1.6],
    size: [5.5, 0.5, 2.6],
    stage: 14,
    explodeVector: [0, 0.4, 0.6],
    short: "A wood deck off the patio door.",
    purpose: "Outdoor living. Guard, stair and lateral load are not verified.",
  });
  box(reg, "deck.platform", "deck", "Deck platform", "structure", [0, 0.22, hW + 1.55], [5.4, 0.04, 2.5], 14, "assembly.deck", { material: MAT.treated });
  box(reg, "deck.beam", "beam", "Deck beam", "structure", [0, 0.1, hW + 1.55], [5.4, 0.184, 0.14], 14, "assembly.deck", { material: MAT.treated });

  addAssembly(reg, {
    id: "assembly.recreation",
    label: "Pool and hot tub",
    trade: "plumbing",
    center: [0, 0.4, hW + 5.2],
    size: [8, 1.4, 6],
    stage: 21,
    explodeVector: [0, 0.3, 1.2],
    short: "Outdoor water. High-scrutiny specimen.",
    purpose: "Force electrical, plumbing, structure and exterior environment to interact. Clearances and bonding are not claimed as CEC-compliant.",
  });
  box(reg, "pool.001", "pool", "In-ground pool (schematic)", "plumbing", [0, -0.15, hW + 5.6], [7.2, 1.1, 3.6], 21, "assembly.recreation", { material: MAT.concrete, tags: ["pool"] });
  box(reg, "hottub.001", "hot-tub", "Hot tub", "plumbing", [2.4, 0.55, hW + 1.7], [2.0, 0.85, 2.0], 21, "assembly.deck", { material: MAT.porcelain, tags: ["hot-tub"] });
  box(reg, "equipment.pad.001", "equipment-pad", "Equipment pad", "structure", [-3.4, 0.08, hW + 5.2], [1.2, 0.12, 0.8], 16, "assembly.recreation", { material: MAT.concrete });
  box(reg, "hvac.heatpump.outdoor.001", "heat-pump-outdoor", "Pool heater / HP (schematic)", "hvac", [-3.4, 0.5, hW + 5.2], [0.9, 0.7, 0.4], 16, "assembly.recreation", { material: MAT.steel });
  box(reg, "electrical.panel.main", "panel", "Cottage panel", "electrical", [-3.6, 1.4, -hW + 0.2], [0.1, 0.7, 0.35], 17, "assembly.walls", { material: MAT.panel });
  const bond = segmentBox([-3.6, 0.3, -hW + 0.2], [0, -0.4, hW + 5.6], 0.012);
  box(reg, "electrical.bonding.pool", "bonding", "Pool bonding (schematic)", "electrical", bond.center, bond.size, 17, "assembly.recreation", {
    material: MAT.cable,
    run: { from: [-3.6, 0.3, -hW + 0.2], to: [0, -0.4, hW + 5.6], flow: "from-to" },
    tags: ["bonding", "pool"],
    short: "A schematic equipotential bond. Not a CEC 68 installation.",
    purpose: "Show that pool metal and electrical earth are related. Conductor size, connections and inspection are unknown.",
  });
  box(reg, "electrical.receptacle.gfci.deck", "receptacle", "Deck receptacle (GFCI unknown)", "electrical", [1.8, 1.05, hW - 0.05], [0.07, 0.11, 0.04], 21, "assembly.walls", {
    material: MAT.device,
    tags: ["gfci-unverified"],
    short: "An exterior receptacle near water. GFCI protection is not proven in this graph.",
    purpose: "Force the engine to say MISSING_INFORMATION rather than invent CEC 26/68 compliance.",
  });

  const assemblies = Object.values(reg.components).filter((c) => c.type === "assembly").map((c) => c.id);
  const relations: Relation[] = [
    { id: "rel.tub-on-deck", kind: "supported-by", a: "hottub.001", b: "deck.platform", authorityClass: "PROJECT_MODEL_ASSUMPTION" },
    { id: "rel.pool-clearance-door", kind: "clearance-between", a: "pool.001", b: "envelope.door.front", value: 1.2, authorityClass: "PROJECT_MODEL_ASSUMPTION" },
    { id: "rel.heater-on-pad", kind: "supported-by", a: "hvac.heatpump.outdoor.001", b: "equipment.pad.001", authorityClass: "PROJECT_MODEL_ASSUMPTION" },
  ];
  const graph: BuildingGraph = {
    id: "PEI-RURAL-POOL-001",
    version: "0.3.0-depth",
    title: "PEI rural cottage with deck, hot tub and pool",
    jurisdictionId: "ca-pei",
    projectDate: "2026-09-10",
    components: reg.components,
    rootIds: assemblies,
    assemblies,
    systems: [
      {
        id: "system.electrical",
        trade: "electrical",
        nodes: [
          { id: "electrical.panel.main", componentId: "electrical.panel.main", kind: "panel", label: "Cottage panel" },
          { id: "electrical.bonding.pool", componentId: "electrical.bonding.pool", kind: "bonding", label: "Pool bonding" },
        ],
        connections: [{ id: "el.bond", from: "electrical.panel.main", to: "electrical.bonding.pool", kind: "bonding" }],
      },
    ],
    relations,
    attachments: [
      {
        id: "att.tub-deck",
        hostId: "deck.platform",
        attachedId: "hottub.001",
        kind: "bearing",
        verified: false,
        authorityClass: "UNKNOWN",
      },
    ],
  };
  graph.site = siteFacts(graph);
  return Object.freeze(graph) as BuildingGraph;
}
