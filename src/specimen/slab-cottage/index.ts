import type { BuildingGraph, Relation, Vec3 } from "@/crates/building-graph/types";
import { siteFacts } from "@/crates/site/facts";
import { addBox, addAssembly, MAT, PROV_EDU, PROV_MODEL, segmentBox } from "../pei-part9-house/helper";
import { createRegistry } from "../pei-part9-house/registry";

const L = 7.2;
const W = 6.0;
const hL = L / 2;
const hW = W / 2;
const slabY = 0.12;
const floorTop = 0.18;
const wallTop = 2.62;
const ridgeY = wallTop + hW * 0.4;

function box(reg: ReturnType<typeof createRegistry>, id: string, type: Parameters<typeof addBox>[1]["type"], label: string, trade: Parameters<typeof addBox>[1]["trade"], c: Vec3, s: Vec3, stage: number, parent: string, extra: Partial<Parameters<typeof addBox>[1]> = {}) {
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
    explodeVector: extra.explodeVector ?? [0, 0.4, 0],
    tags: extra.tags,
    short: extra.short ?? label,
    purpose: extra.purpose ?? "Project model of this slab-on-grade cottage.",
    provenance: extra.provenance ?? PROV_MODEL,
    system: extra.system,
    run: extra.run,
    penetration: extra.penetration,
    dependencies: extra.dependencies,
  });
}

export function buildSlabCottage(): BuildingGraph {
  const reg = createRegistry();
  addAssembly(reg, {
    id: "assembly.foundation",
    label: "Slab on grade",
    trade: "foundation",
    center: [0, slabY, 0],
    size: [L + 0.8, 0.4, W + 0.8],
    stage: 4,
    explodeVector: [0, -0.6, 0],
    short: "A thickened-edge slab. No basement.",
    purpose: "A different dwelling type from the PEI basement house.",
    tags: ["foundation"],
  });
  box(reg, "site.grade", "site", "Grade", "foundation", [0, -0.04, 0], [22, 0.08, 18], 1, "assembly.foundation", { material: MAT.grass, explodeVector: [0, -0.2, 0] });
  box(reg, "slab.grade", "slab", "Slab on grade", "foundation", [0, slabY, 0], [L + 0.4, 0.24, W + 0.4], 4, "assembly.foundation", { material: MAT.concrete, short: "The floor and foundation in one.", purpose: "Carry the wood house. Thickness and reinforcing are demonstration values, not a structural design." });

  addAssembly(reg, { id: "assembly.walls", label: "Walls", trade: "structure", center: [0, 1.4, 0], size: [L, 2.5, W], stage: 8, explodeVector: [0, 0, 0], short: "Wood-framed exterior walls on a slab.", purpose: "Define the cottage.", tags: ["wall"] });
  const walls: { id: string; c: Vec3; s: Vec3 }[] = [
    { id: "wall.front", c: [0, (floorTop + wallTop) / 2, hW - 0.07], s: [L, wallTop - floorTop, 0.14] },
    { id: "wall.back", c: [0, (floorTop + wallTop) / 2, -hW + 0.07], s: [L, wallTop - floorTop, 0.14] },
    { id: "wall.left", c: [-hL + 0.07, (floorTop + wallTop) / 2, 0], s: [0.14, wallTop - floorTop, W - 0.28] },
    { id: "wall.right", c: [hL - 0.07, (floorTop + wallTop) / 2, 0], s: [0.14, wallTop - floorTop, W - 0.28] },
  ];
  for (const w of walls) {
    box(reg, `assembly.${w.id}.plate.bottom`, "bottom-plate", `${w.id} bottom plate`, "structure", [w.c[0], floorTop + 0.019, w.c[2]], [w.s[0], 0.038, w.s[2]], 8, "assembly.walls");
    box(reg, `assembly.${w.id}.plate.top`, "top-plate", `${w.id} top plate`, "structure", [w.c[0], wallTop - 0.019, w.c[2]], [w.s[0], 0.038, w.s[2]], 8, "assembly.walls");
    const along = w.s[0] > w.s[2] ? 0 : 2;
    const span = along === 0 ? w.s[0] : w.s[2];
    let i = 0;
    for (let s = -span / 2 + 0.2; s <= span / 2 - 0.2; s += 0.406) {
      const c: Vec3 = along === 0 ? [s, (floorTop + wallTop) / 2, w.c[2]] : [w.c[0], (floorTop + wallTop) / 2, s];
      const size: Vec3 = along === 0 ? [0.038, wallTop - floorTop - 0.08, 0.14] : [0.14, wallTop - floorTop - 0.08, 0.038];
      box(reg, `assembly.${w.id}.stud.${String(i).padStart(2, "0")}`, "common-stud", "Stud", "structure", c, size, 8, "assembly.walls");
      i += 1;
    }
  }
  box(reg, "envelope.window.front", "window-unit", "Front window", "envelope", [0.4, 1.4, hW], [1.2, 1.1, 0.12], 13, "assembly.walls", { material: MAT.glass });
  box(reg, "envelope.door.front", "door-unit", "Front door", "envelope", [-2.2, 1.2, hW], [0.9, 2.05, 0.1], 13, "assembly.walls", { material: MAT.wood });

  addAssembly(reg, { id: "assembly.roof", label: "Roof", trade: "structure", center: [0, ridgeY, 0], size: [L + 0.6, 1.6, W + 0.8], stage: 11, explodeVector: [0, 1.2, 0], short: "A simple gable on the slab cottage.", purpose: "Close the house.", tags: ["roof"] });
  box(reg, "roof.ridge", "ridge", "Ridge", "structure", [0, ridgeY, 0], [L + 0.2, 0.235, 0.038], 11, "assembly.roof");
  box(reg, "roof.rafter.s.00", "rafter", "Rafter S", "structure", [0, (ridgeY + wallTop) / 2, hW / 2], [0.038, 0.184, Math.hypot(hW + 0.35, ridgeY - wallTop)], 11, "assembly.roof");
  box(reg, "roof.rafter.n.00", "rafter", "Rafter N", "structure", [0, (ridgeY + wallTop) / 2, -hW / 2], [0.038, 0.184, Math.hypot(hW + 0.35, ridgeY - wallTop)], 11, "assembly.roof");
  box(reg, "roof.sheathing.s.0", "roof-sheathing", "Roof sheathing", "structure", [0, (ridgeY + wallTop) / 2 + 0.08, hW / 2], [L + 0.3, 0.011, Math.hypot(hW + 0.35, ridgeY - wallTop)], 12, "assembly.roof", { material: MAT.osb });
  box(reg, "roof.covering.s", "roof-covering", "Shingles", "envelope", [0, (ridgeY + wallTop) / 2 + 0.12, hW / 2], [L + 0.3, 0.01, Math.hypot(hW + 0.4, ridgeY - wallTop)], 14, "assembly.roof", { material: MAT.shingle });
  box(reg, "roof.fascia.s", "fascia", "Fascia", "envelope", [0, wallTop - 0.1, hW + 0.35], [L + 0.4, 0.18, 0.025], 12, "assembly.roof");

  addAssembly(reg, { id: "assembly.plumbing", label: "Plumbing", trade: "plumbing", center: [-1.6, 1, -0.4], size: [4, 2.4, 4], stage: 15, explodeVector: [0, 1, 0], short: "Compact DWV and supply in walls and the slab.", purpose: "Show services without a basement to hide in.", tags: ["plumbing"] });
  const stack: Vec3 = [-2.1, 1.2, -1.4];
  const stackRun = { from: [-2.1, floorTop, -1.4] as Vec3, to: [-2.1, wallTop + 0.4, -1.4] as Vec3, flow: "from-to" as const };
  const { center: sc, size: ss } = segmentBox(stackRun.from, stackRun.to, 0.075);
  box(reg, "plumbing.dwv.stack.001", "pipe-dwv", "Soil stack", "plumbing", sc, ss, 15, "assembly.plumbing", { material: MAT.abs, run: stackRun, explodeGroup: "assembly.wall.left", tags: ["plumbing", "dwv"] });
  box(reg, "plumbing.fixture.sink.bath", "fixture", "Lavatory", "plumbing", [-2.1, floorTop + 0.42, -0.9], [0.5, 0.18, 0.4], 21, "assembly.plumbing", { material: MAT.porcelain });
  box(reg, "plumbing.waterheater.001", "water-heater", "Water heater", "plumbing", [2.4, floorTop + 0.55, -2.2], [0.5, 1.1, 0.5], 15, "assembly.plumbing", { material: MAT.steel });

  addAssembly(reg, { id: "assembly.electrical", label: "Electrical", trade: "electrical", center: [2.4, 1.2, -2.2], size: [2, 2, 2], stage: 17, explodeVector: [0, 0.8, 0], short: "Panel and a few cables in this cottage.", purpose: "Show a service without claiming CEC sizing.", tags: ["electrical"] });
  box(reg, "electrical.panel.main", "panel", "Panel", "electrical", [2.55, 1.4, -2.55], [0.1, 0.7, 0.35], 17, "assembly.electrical", { material: MAT.panel });
  const cab = { from: [2.55, 1.4, -2.4] as Vec3, to: [2.55, 0.4, 2.4] as Vec3, flow: "from-to" as const };
  const cb = segmentBox(cab.from, cab.to, 0.016);
  box(reg, "electrical.cable.front.001", "cable", "Cable to front", "electrical", cb.center, cb.size, 17, "assembly.electrical", { material: MAT.cable, run: cab });

  addAssembly(reg, { id: "assembly.hvac", label: "HVAC", trade: "hvac", center: [2.2, 0.8, 1.2], size: [2, 2, 2], stage: 16, explodeVector: [0, 0.6, 0], short: "Ductless heat pump.", purpose: "A slab house does not need a basement trunk.", tags: ["hvac"] });
  box(reg, "hvac.heatpump.indoor.001", "heat-pump-indoor", "Indoor head", "hvac", [2.4, 2.2, 0], [0.8, 0.28, 0.22], 16, "assembly.hvac", { material: MAT.steel });
  box(reg, "hvac.heatpump.outdoor.001", "heat-pump-outdoor", "Outdoor unit", "hvac", [hL + 0.7, 0.45, 0], [0.85, 0.7, 0.35], 16, "assembly.hvac", { material: MAT.steel });

  addAssembly(reg, { id: "assembly.finish", label: "Finish", trade: "finish", center: [0, 1.4, 0], size: [L, 2.4, W], stage: 20, explodeVector: [0, 0, 0], short: "Drywall of the cottage.", purpose: "Conceal the walls.", tags: ["finish"] });
  box(reg, "finish.drywall.front", "drywall", "Front drywall", "finish", [0, 1.4, hW - 0.16], [L - 0.3, 2.3, 0.013], 20, "assembly.finish", { material: MAT.gypsum });

  const assemblies = Object.values(reg.components).filter((c) => c.type === "assembly").map((c) => c.id);
  const relations: Relation[] = [
    { id: "rel.slab-cottage-stack-wall", kind: "contained-in", a: "plumbing.dwv.stack.001", b: "assembly.walls", authorityClass: "PROJECT_MODEL_ASSUMPTION" },
    { id: "rel.slab-cottage-head-above-floor", kind: "above", a: "hvac.heatpump.indoor.001", b: "slab.grade", authorityClass: "PROJECT_MODEL_ASSUMPTION" },
  ];
  const graph: BuildingGraph = {
    id: "PEI-SLAB-COTTAGE-001",
    version: "0.3.0-depth",
    title: "PEI slab-on-grade cottage",
    jurisdictionId: "ca-pei",
    projectDate: "2026-09-10",
    components: reg.components,
    rootIds: assemblies,
    assemblies,
    systems: [
      {
        id: "system.plumbing",
        trade: "plumbing",
        nodes: [
          { id: "plumbing.dwv.stack.001", componentId: "plumbing.dwv.stack.001", kind: "pipe-dwv", label: "Soil stack" },
          { id: "plumbing.fixture.sink.bath", componentId: "plumbing.fixture.sink.bath", kind: "fixture", label: "Lavatory" },
        ],
        connections: [{ id: "sc.1", from: "plumbing.fixture.sink.bath", to: "plumbing.dwv.stack.001", kind: "drain" }],
      },
    ],
    relations,
  };
  graph.site = siteFacts(graph);
  void stack;
  void PROV_EDU;
  return Object.freeze(graph) as BuildingGraph;
}
