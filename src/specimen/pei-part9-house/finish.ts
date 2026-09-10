import type { Vec3 } from "@/crates/building-graph/types";
import { addAssembly, addBox, MAT } from "./helper";
import { openingsOn } from "./openings";
import { P, Y, halfL, halfW } from "./params";
import type { Registry } from "./registry";

const DRY = 0.013;

function lumber(key: "front" | "back" | "left" | "right", along: number, h: number, t: number): Vec3 {
  if (key === "front" || key === "back") return [along, h, t];
  return [t, h, along];
}

function at(key: "front" | "back" | "left" | "right", s: number, inset: number) {
  if (key === "front") return { x: s, z: halfW - inset };
  if (key === "back") return { x: s, z: -halfW + inset };
  if (key === "left") return { x: -halfL + inset, z: s };
  return { x: halfL - inset, z: s };
}

export function addFinish(reg: Registry) {
  addAssembly(reg, {
    id: "assembly.finish",
    label: "Drywall and interior finish",
    trade: "finish",
    center: [0, (Y.floorTop + Y.wallTop) / 2, 0],
    size: [P.length, Y.wallTop - Y.floorTop, P.width],
    stage: 20,
    dependencies: ["assembly.thermal"],
    explodeVector: [0, 0.5, 0],
    short: "Close-in: gypsum, paint, trim and floor finish.",
    purpose: "Conceal the services — and prove why time-travel, x-ray and hide-finish exist.",
    tags: ["finish"],
  });

  const inset = P.sheathing + P.stud.d + 0.02;
  const h = Y.wallTop - Y.floorTop;
  const y = (Y.floorTop + Y.wallTop) / 2;

  addFrontDrywall(reg, inset, h);

  for (const key of ["back", "left", "right"] as const) {
    const p = at(key, 0, inset);
    const along = key === "back" ? P.length : P.width;
    const out: Vec3 = key === "back" ? [0, 0.1, -1.3] : key === "left" ? [-1.3, 0.1, 0] : [1.3, 0.1, 0];
    addBox(reg, {
      id: `finish.drywall.${key}.panel.001`,
      type: "drywall",
      label: `${cap(key)} drywall`,
      parentId: `assembly.wall.${key}`,
      trade: "finish",
      center: [p.x, y, p.z],
      size: lumber(key, along - 0.08, h - 0.06, DRY),
      material: MAT.gypsum,
      stage: 20,
      explodeGroup: `assembly.wall.${key}`,
      explodeVector: out,
      localExplodeVector: [out[0] * -0.55, 0.05, out[2] * -0.55],
      tradeExplodeVector: [out[0] * -1.2, 0.1, out[2] * -1.2],
      tags: ["finish", "drywall", key],
      short: `Interior gypsum on the ${key} wall.`,
      purpose: "Close the wall. Hide finish or scrub time to see what it conceals.",
      dependencies: [`thermal.wall.${key}.vapour-barrier`],
    });
    addBox(reg, {
      id: `finish.paint.${key}`,
      type: "paint",
      label: `${cap(key)} interior paint`,
      parentId: `assembly.wall.${key}`,
      trade: "finish",
      center: [
        p.x + (key === "left" ? DRY : key === "right" ? -DRY : 0),
        y,
        p.z + (key === "back" ? DRY : 0),
      ],
      size: lumber(key, along - 0.1, h - 0.08, 0.004),
      material: MAT.paint,
      stage: 22,
      explodeGroup: `assembly.wall.${key}`,
      explodeVector: out,
      localExplodeVector: [out[0] * -0.7, 0.05, out[2] * -0.7],
      tags: ["finish", "paint", key],
      short: "Interior paint film.",
      purpose: "The last interior layer. Not a coating specification.",
      dependencies: [`finish.drywall.${key}.panel.001`],
    });
  }

  addBox(reg, {
    id: "finish.drywall.bath.panel.001",
    type: "drywall",
    label: "Bathroom wet-wall drywall",
    parentId: "assembly.wall.bath",
    trade: "finish",
    center: [-2.25 - 0.05, y, -1.1],
    size: [DRY, h - 0.08, 4.3],
    material: MAT.gypsum,
    stage: 20,
    explodeGroup: "assembly.wall.bath",
    explodeVector: [-1.4, 0.2, 0],
    localExplodeVector: [-0.55, 0.05, 0],
    tradeExplodeVector: [-1.6, 0.1, 0],
    tags: ["finish", "drywall", "bath"],
    short: "Gypsum on the bathroom wet wall.",
    purpose: "Close the wall that hides supply, DWV, vent, cable and exhaust.",
    dependencies: ["assembly.wall.bath"],
  });
  addBox(reg, {
    id: "finish.paint.bath",
    type: "paint",
    label: "Bathroom wall paint",
    parentId: "assembly.wall.bath",
    trade: "finish",
    center: [-2.25 - 0.06, y, -1.1],
    size: [0.004, h - 0.1, 4.2],
    material: MAT.paint,
    stage: 22,
    explodeGroup: "assembly.wall.bath",
    explodeVector: [-1.55, 0.2, 0],
    localExplodeVector: [-0.7, 0.05, 0],
    tags: ["finish", "paint", "bath"],
    short: "Finish paint on the wet wall.",
    purpose: "The surface the occupant sees. X-ray or rewind to open it.",
    dependencies: ["finish.drywall.bath.panel.001"],
  });

  addBox(reg, {
    id: "finish.drywall.ceiling.001",
    type: "drywall",
    label: "Ceiling drywall",
    parentId: "assembly.finish",
    trade: "finish",
    center: [0, Y.wallTop - 0.04, 0],
    size: [P.length - 0.2, DRY, P.width - 0.2],
    material: MAT.gypsum,
    stage: 20,
    explodeGroup: "assembly.finish",
    explodeVector: [0, 1.1, 0],
    localExplodeVector: [0, -0.4, 0],
    tradeExplodeVector: [0, 1.4, 0],
    tags: ["finish", "drywall"],
    short: "Ceiling gypsum.",
    purpose: "Close the ceiling over services and insulation.",
    dependencies: ["thermal.ceiling.air-barrier"],
  });

  addBox(reg, {
    id: "finish.floor.bath",
    type: "floor-finish",
    label: "Bathroom floor finish",
    parentId: "assembly.finish",
    trade: "finish",
    center: [-3.3, Y.floorTop + 0.008, -1.0],
    size: [2.4, 0.012, 3.6],
    material: MAT.flooring,
    stage: 22,
    explodeGroup: "assembly.finish",
    explodeVector: [0, 0.25, 0],
    tags: ["finish", "floor", "bath"],
    short: "Bathroom floor finish in the wet zone.",
    purpose: "A finished floor in a selected room. Product is a demonstration.",
    dependencies: ["subfloor.0"],
  });
  addBox(reg, {
    id: "finish.floor.kitchen",
    type: "floor-finish",
    label: "Kitchen floor finish",
    parentId: "assembly.finish",
    trade: "finish",
    center: [2.6, Y.floorTop + 0.008, 2.4],
    size: [3.4, 0.012, 2.2],
    material: MAT.flooring,
    stage: 22,
    explodeGroup: "assembly.finish",
    explodeVector: [0, 0.25, 0],
    tags: ["finish", "floor", "kitchen"],
    short: "Kitchen floor finish in the service zone.",
    purpose: "Finish in a second selected room.",
    dependencies: ["subfloor.0"],
  });

  addBox(reg, {
    id: "finish.trim.base.front",
    type: "trim",
    label: "Front wall baseboard",
    parentId: "assembly.wall.front",
    trade: "finish",
    center: [0, Y.floorTop + 0.05, halfW - inset - 0.01],
    size: [P.length - 0.3, 0.09, 0.014],
    material: MAT.wood,
    stage: 21,
    explodeGroup: "assembly.wall.front",
    explodeVector: [0, 0.1, 2.4],
    localExplodeVector: [0, -0.15, 0.6],
    tags: ["finish", "trim", "front", "window-wall"],
    short: "Baseboard on the teaching wall.",
    purpose: "Interior trim covering the drywall-to-floor joint.",
    dependencies: ["finish.drywall.front.panel.000"],
  });
  addBox(reg, {
    id: "finish.trim.door.front",
    type: "trim",
    label: "Front door casing",
    parentId: "assembly.wall.front",
    trade: "finish",
    center: [-2.55, Y.floorTop + 1.05, halfW - inset - 0.01],
    size: [1.02, 2.12, 0.016],
    material: MAT.wood,
    stage: 21,
    explodeGroup: "assembly.wall.front",
    explodeVector: [0, 0.15, 2.35],
    localExplodeVector: [0, 0, 0.65],
    tags: ["finish", "trim", "front"],
    short: "Interior casing at the front door.",
    purpose: "Finish the door opening from inside.",
    dependencies: ["envelope.door.front.001"],
  });
}

function addFrontDrywall(reg: Registry, inset: number, wallH: number) {
  const openings = openingsOn("front");
  const edges = [-P.length / 2, ...openings.flatMap((o) => [o.s - o.w / 2, o.s + o.w / 2]), P.length / 2].sort(
    (a, b) => a - b,
  );
  let n = 0;
  for (let i = 0; i < edges.length - 1; i++) {
    const a = edges[i]!;
    const b = edges[i + 1]!;
    const w = b - a;
    if (w < 0.06) continue;
    const mid = (a + b) / 2;
    const opening = openings.find((o) => mid > o.s - o.w / 2 + 0.01 && mid < o.s + o.w / 2 - 0.01);
    const p = at("front", mid, inset);
    if (!opening) {
      panel(reg, n++, p, (Y.floorTop + Y.wallTop) / 2, w, wallH);
      continue;
    }
    if (opening.sill > 0.12) {
      panel(reg, n++, p, Y.floorTop + opening.sill / 2, w, opening.sill);
    }
    const topH = Y.wallTop - (Y.floorTop + opening.sill + opening.h);
    if (topH > 0.1) {
      panel(reg, n++, p, Y.wallTop - topH / 2, w, topH);
    }
  }
  addBox(reg, {
    id: "finish.paint.front",
    type: "paint",
    label: "Front wall interior paint",
    parentId: "assembly.wall.front",
    trade: "finish",
    center: [0, (Y.floorTop + Y.wallTop) / 2, halfW - inset - 0.008],
    size: [P.length - 0.15, wallH - 0.1, 0.003],
    material: MAT.paint,
    stage: 22,
    explodeGroup: "assembly.wall.front",
    explodeVector: [0, 0.1, 2.5],
    localExplodeVector: [0, 0.05, 0.75],
    tradeExplodeVector: [0, 0.1, 1.5],
    tags: ["finish", "paint", "front", "window-wall"],
    short: "Paint on the teaching wall.",
    purpose: "The interior finish film. Explode the wall to separate it from drywall and services.",
    dependencies: ["finish.drywall.front.panel.000"],
  });
}

function panel(reg: Registry, n: number, p: { x: number; z: number }, y: number, along: number, h: number) {
  addBox(reg, {
    id: `finish.drywall.front.panel.${String(n).padStart(3, "0")}`,
    type: "drywall",
    label: `Front drywall ${n + 1}`,
    parentId: "assembly.wall.front",
    trade: "finish",
    center: [p.x, y, p.z],
    size: [along - 0.006, h, DRY],
    material: MAT.gypsum,
    stage: 20,
    explodeGroup: "assembly.wall.front",
    explodeVector: [0, 1.35, 2.1],
    localExplodeVector: [0, 0.05, 0.62],
    tradeExplodeVector: [0, 0.1, 1.3],
    tags: ["finish", "drywall", "front", "window-wall"],
    short: "Gypsum panel on the teaching wall.",
    purpose: "Close the wall after insulation and services. Cut around the openings.",
    dependencies: ["thermal.wall.front.vapour-barrier"],
  });
}

function cap(s: string) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}
