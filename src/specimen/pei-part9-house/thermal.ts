import type { Vec3 } from "@/crates/building-graph/types";
import { addAssembly, addBox, MAT, PROV_SCIENCE } from "./helper";
import { openingsOn } from "./openings";
import { P, Y, halfL, halfW } from "./params";
import type { Registry } from "./registry";

function wallInterior(key: "front" | "back" | "left" | "right") {
  const cavity = P.sheathing + P.stud.d / 2;
  if (key === "front") return { inset: cavity, out: [0, 0.15, 1.6] as Vec3, along: P.length, isX: true as const, sign: 1 };
  if (key === "back") return { inset: cavity, out: [0, 0.15, -1.6] as Vec3, along: P.length, isX: true as const, sign: -1 };
  if (key === "left") return { inset: cavity, out: [-1.6, 0.15, 0] as Vec3, along: P.width, isX: false as const, sign: -1 };
  return { inset: cavity, out: [1.6, 0.15, 0] as Vec3, along: P.width, isX: false as const, sign: 1 };
}

function at(key: "front" | "back" | "left" | "right", s: number, inset: number) {
  if (key === "front") return { x: s, z: halfW - inset };
  if (key === "back") return { x: s, z: -halfW + inset };
  if (key === "left") return { x: -halfL + inset, z: s };
  return { x: halfL - inset, z: s };
}

function lumber(key: "front" | "back" | "left" | "right", along: number, h: number, t: number): Vec3 {
  if (key === "front" || key === "back") return [along, h, t];
  return [t, h, along];
}

export function addThermal(reg: Registry) {
  addAssembly(reg, {
    id: "assembly.thermal",
    label: "Insulation and control layers",
    trade: "thermal",
    center: [0, (Y.floorTop + Y.wallTop) / 2, 0],
    size: [P.length, Y.wallTop - Y.floorTop, P.width],
    stage: 19,
    dependencies: ["assembly.envelope", "assembly.plumbing", "assembly.electrical", "assembly.hvac"],
    explodeVector: [0, 0.8, 0],
    short: "Thermal, air and vapour control layers of this specimen.",
    purpose: "Make the hidden enclosure layers inspectable. This is building science visualization, not hygrothermal simulation.",
    tags: ["thermal"],
  });

  const h = Y.wallTop - Y.floorTop;
  const y = (Y.floorTop + Y.wallTop) / 2;
  const battT = P.stud.d - 0.01;

  // Teaching wall: per-bay insulation
  const frontOpen = openingsOn("front");
  let bay = 0;
  const start = -halfL + 0.2;
  const end = halfL - 0.2;
  for (let s = start; s <= end + 1e-9; s += P.studOc) {
    if (frontOpen.some((o) => Math.abs(s - o.s) < o.w / 2 + 0.08)) continue;
    const p = at("front", s, P.sheathing + P.stud.d / 2);
    addBox(reg, {
      id: `thermal.wall.front.insulation.bay.${String(bay).padStart(3, "0")}`,
      type: "insulation",
      label: `Front wall insulation bay ${bay + 1}`,
      parentId: "assembly.wall.front",
      trade: "thermal",
      center: [p.x, y, p.z],
      size: [P.studOc - P.stud.t - 0.01, h - 0.08, battT],
      material: MAT.insulation,
      stage: 19,
      explodeGroup: "assembly.wall.front",
      explodeVector: [0, 1.35, 2.1],
      localExplodeVector: [0, 0.05, 0.22],
      tradeExplodeVector: [0, 0.2, 1.2],
      tags: ["thermal", "thermal-control", "front", "window-wall"],
      short: "Batt insulation in one stud bay of the teaching wall.",
      purpose: "Fill the cavity so the wall has a thermal-control layer. RSI values are not claimed.",
      provenance: PROV_SCIENCE,
      visualization: "BUILDING-SCIENCE VISUALIZATION",
      dependencies: ["assembly.wall.front.stud.00"],
    });
    bay += 1;
  }

  for (const key of ["back", "left", "right"] as const) {
    const g = wallInterior(key);
    const p = at(key, 0, g.inset);
    addBox(reg, {
      id: `thermal.wall.${key}.insulation`,
      type: "insulation",
      label: `${cap(key)} wall insulation`,
      parentId: `assembly.wall.${key}`,
      trade: "thermal",
      center: [p.x, y, p.z],
      size: lumber(key, g.along - 0.2, h - 0.1, battT),
      material: MAT.insulation,
      stage: 19,
      explodeGroup: `assembly.wall.${key}`,
      explodeVector: g.out,
      localExplodeVector: [g.out[0] * 0.15, 0.05, g.out[2] * 0.15],
      tradeExplodeVector: g.out,
      tags: ["thermal", "thermal-control", key],
      short: `Cavity insulation in the ${key} wall, shown as a single teaching panel.`,
      purpose: "Repeated pattern — depth lives on the front teaching wall.",
      provenance: PROV_SCIENCE,
      visualization: "BUILDING-SCIENCE VISUALIZATION",
      dependencies: [`assembly.wall.${key}`],
    });
  }

  addBox(reg, {
    id: "thermal.ceiling.insulation.001",
    type: "insulation",
    label: "Attic / ceiling insulation (south)",
    parentId: "assembly.roof",
    trade: "thermal",
    center: [0, Y.wallTop + 0.08, halfW / 2],
    size: [P.length - 0.2, 0.16, halfW - 0.15],
    material: MAT.insulation,
    stage: 19,
    explodeGroup: "assembly.roof",
    explodeVector: [0, 1.6, 0.4],
    localExplodeVector: [0, 0.35, 0],
    tradeExplodeVector: [0, 1.8, 0],
    tags: ["thermal", "thermal-control", "roof"],
    short: "Ceiling insulation at the attic floor.",
    purpose: "The thermal-control layer at the roof/ceiling. Depth is a demonstration.",
    provenance: PROV_SCIENCE,
    visualization: "BUILDING-SCIENCE VISUALIZATION",
    dependencies: ["roof.ceiling.00"],
  });
  addBox(reg, {
    id: "thermal.ceiling.insulation.002",
    type: "insulation",
    label: "Attic / ceiling insulation (north)",
    parentId: "assembly.roof",
    trade: "thermal",
    center: [0, Y.wallTop + 0.08, -halfW / 2],
    size: [P.length - 0.2, 0.16, halfW - 0.15],
    material: MAT.insulation,
    stage: 19,
    explodeGroup: "assembly.roof",
    explodeVector: [0, 1.6, -0.4],
    localExplodeVector: [0, 0.35, 0],
    tags: ["thermal", "thermal-control", "roof"],
    short: "Ceiling insulation, north half.",
    purpose: "Continue the attic thermal layer.",
    provenance: PROV_SCIENCE,
    visualization: "BUILDING-SCIENCE VISUALIZATION",
    dependencies: ["roof.ceiling.00"],
  });

  // Air and vapour control — interior of teaching wall, panels elsewhere
  const airInset = P.sheathing + P.stud.d + 0.006;
  for (const key of ["front", "back", "left", "right"] as const) {
    const g = wallInterior(key);
    const p = at(key, 0, airInset);
    addBox(reg, {
      id: `thermal.wall.${key}.air-barrier`,
      type: "air-barrier",
      label: `${cap(key)} air-control layer`,
      parentId: `assembly.wall.${key}`,
      trade: "thermal",
      center: [p.x, y, p.z],
      size: lumber(key, g.along - 0.05, h - 0.04, 0.006),
      material: MAT.poly,
      stage: 19,
      explodeGroup: `assembly.wall.${key}`,
      explodeVector: [g.out[0] * 0.55, 0.1, g.out[2] * 0.55],
      localExplodeVector: [g.out[0] * -0.28, 0.05, g.out[2] * -0.28],
      tradeExplodeVector: [g.out[0] * -0.9, 0.1, g.out[2] * -0.9],
      tags: ["thermal", "air-control", key, key === "front" ? "window-wall" : key],
      short: "Air-control layer on the interior of the framing.",
      purpose: "Continuity of air control is a building-science principle. Product and location are a common assembly, not the only legal wall.",
      provenance: PROV_SCIENCE,
      visualization: "BUILDING-SCIENCE VISUALIZATION",
      dependencies: [`thermal.wall.${key === "front" ? "front.insulation.bay.000" : `${key}.insulation`}`],
    });
    addBox(reg, {
      id: `thermal.wall.${key}.vapour-barrier`,
      type: "vapour-barrier",
      label: `${cap(key)} vapour-control layer`,
      parentId: `assembly.wall.${key}`,
      trade: "thermal",
      center: [p.x + (key === "left" ? 0.006 : key === "right" ? -0.006 : 0), y, p.z + (key === "front" ? -0.006 : key === "back" ? 0.006 : 0)],
      size: lumber(key, g.along - 0.05, h - 0.04, 0.004),
      material: MAT.poly,
      stage: 19,
      explodeGroup: `assembly.wall.${key}`,
      explodeVector: [g.out[0] * 0.45, 0.1, g.out[2] * 0.45],
      localExplodeVector: [g.out[0] * -0.4, 0.08, g.out[2] * -0.4],
      tradeExplodeVector: [g.out[0] * -1.1, 0.12, g.out[2] * -1.1],
      tags: ["thermal", "vapour-control", key, key === "front" ? "window-wall" : key],
      short: "Vapour-control layer, shown on the interior (warm-in-winter) side of this PEI demonstration wall.",
      purpose: "Vapour control is distinct from air and water control. Climate, product permeance and wetting/drying are not simulated.",
      provenance: PROV_SCIENCE,
      visualization: "BUILDING-SCIENCE VISUALIZATION",
      dependencies: [`thermal.wall.${key}.air-barrier`],
    });
  }

  addBox(reg, {
    id: "thermal.ceiling.air-barrier",
    type: "air-barrier",
    label: "Ceiling air-control layer",
    parentId: "assembly.roof",
    trade: "thermal",
    center: [0, Y.wallTop - 0.02, 0],
    size: [P.length - 0.15, 0.006, P.width - 0.15],
    material: MAT.poly,
    stage: 19,
    explodeGroup: "assembly.roof",
    explodeVector: [0, 1.2, 0],
    localExplodeVector: [0, -0.25, 0],
    tags: ["thermal", "air-control", "roof"],
    short: "Air-control continuity at the ceiling plane.",
    purpose: "Trace air control from walls into the ceiling. Gaps are a common leakage story, not a CFD result.",
    provenance: PROV_SCIENCE,
    visualization: "BUILDING-SCIENCE VISUALIZATION",
    dependencies: ["thermal.ceiling.insulation.001"],
  });

  addBox(reg, {
    id: "thermal.bridge.front.sill",
    type: "insulation",
    label: "Sill / floor thermal-bridge marker",
    parentId: "assembly.wall.front",
    trade: "thermal",
    center: [0, Y.floorTop + 0.04, halfW - P.sheathing - P.stud.d / 2],
    size: [P.length - 0.4, 0.04, 0.04],
    material: MAT.insulation,
    stage: 19,
    explodeGroup: "assembly.wall.front",
    explodeVector: [0, -0.2, 2.0],
    localExplodeVector: [0, -0.35, 0.3],
    tags: ["thermal", "thermal-bridge", "window-wall", "front"],
    short: "A marker where floor and wall thermal layers should meet.",
    purpose: "Thermal bridging is a building-science idea. This object is a teaching flag, not a psi-value.",
    provenance: PROV_SCIENCE,
    visualization: "BUILDING-SCIENCE VISUALIZATION",
    dependencies: ["thermal.wall.front.insulation.bay.000"],
  });
}

function cap(s: string) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}
