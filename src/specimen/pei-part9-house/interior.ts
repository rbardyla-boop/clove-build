import { LUMBER } from "@/crates/geometry/lumber";
import { addAssembly, addBox, MAT } from "./helper";
import { P, Y, halfL, halfW } from "./params";
import type { Registry } from "./registry";

/** Interior partitions that host wet-wall and kitchen services. */
export function addInterior(reg: Registry) {
  addBox(reg, {
    id: "slab.basement",
    type: "slab",
    label: "Basement slab",
    parentId: "assembly.foundation",
    trade: "foundation",
    center: [0, Y.footingTop + 0.05, 0],
    size: [P.length - P.fdnT * 2, 0.1, P.width - P.fdnT * 2],
    material: MAT.concrete,
    stage: 4,
    explodeGroup: "assembly.foundation",
    explodeVector: [0, -0.4, 0],
    tags: ["foundation", "slab"],
    short: "A simplified basement floor slab.",
    purpose: "Give mechanical equipment a place to sit. Thickness is a demonstration, not a structural design.",
    dependencies: ["assembly.foundation"],
  });

  const bathX = -2.25;
  // 2×6 plumbing wall: a 75 mm stack does not physically fit a 2×4 (89 mm) cavity once fittings exist.
  const bathStud = LUMBER["2x6"];
  addAssembly(reg, {
    id: "assembly.wall.bath",
    label: "Bathroom wet wall (interior)",
    trade: "structure",
    center: [bathX, (Y.floorTop + Y.wallTop) / 2, -1.1],
    size: [bathStud.d, Y.wallTop - Y.floorTop, 4.4],
    stage: 8,
    dependencies: ["subfloor.0"],
    explodeVector: [1.6, 0.4, 0],
    short: "2×6 interior plumbing wall that hosts the bathroom wet services.",
    purpose: "Give the 75 mm soil stack a 140 mm cavity. A 2×4 wet wall is not a credible host for that stack.",
    tags: ["wall", "interior", "bath", "plumbing-wall"],
  });

  addBox(reg, {
    id: "assembly.wall.bath.plate.bottom",
    type: "bottom-plate",
    label: "Bath wall bottom plate",
    parentId: "assembly.wall.bath",
    trade: "structure",
    center: [bathX, Y.floorTop + P.plate / 2, -1.1],
    size: [bathStud.d, P.plate, 4.4],
    material: MAT.wood,
    stage: 8,
    explodeGroup: "assembly.wall.bath",
    explodeVector: [1.6, 0.2, 0],
    localExplodeVector: [0, -0.2, 0],
    tags: ["wall", "bath", "plumbing-wall"],
    short: "Bottom plate of the 2×6 bathroom plumbing wall.",
    purpose: "Anchor the wet wall to the floor deck. Depth matches the 2×6 studs.",
    dependencies: ["subfloor.0"],
  });

  const studH = Y.wallTop - Y.floorTop - P.plate * 3;
  const studY = Y.floorTop + P.plate + studH / 2;
  for (let i = 0; i < 8; i++) {
    const z = -3.2 + i * 0.58;
    addBox(reg, {
      id: `assembly.wall.bath.stud.${String(i).padStart(2, "0")}`,
      type: "common-stud",
      label: `Bath wall stud ${i + 1}`,
      parentId: "assembly.wall.bath",
      trade: "structure",
      center: [bathX, studY, z],
      size: [bathStud.d, studH, bathStud.t],
      material: MAT.wood,
      stage: 8,
      explodeGroup: "assembly.wall.bath",
      explodeVector: [1.6, 0.3, (i - 3.5) * 0.12],
      localExplodeVector: [0.25, 0, (i - 3.5) * 0.08],
      tags: ["wall", "bath", "plumbing-wall"],
      short: "A 2×6 stud in the bathroom plumbing wall.",
      purpose: "Frame the wet wall at 2×6 so the stack has a cavity, and leave bays for supply and vent.",
      dependencies: ["assembly.wall.bath.plate.bottom"],
    });
  }

  addBox(reg, {
    id: "assembly.wall.bath.plate.top",
    type: "top-plate",
    label: "Bath wall top plate",
    parentId: "assembly.wall.bath",
    trade: "structure",
    center: [bathX, Y.wallTop - P.plate, -1.1],
    size: [bathStud.d, P.plate * 2, 4.4],
    material: MAT.wood,
    stage: 8,
    explodeGroup: "assembly.wall.bath",
    explodeVector: [1.6, 0.55, 0],
    localExplodeVector: [0, 0.3, 0],
    tags: ["wall", "bath", "plumbing-wall"],
    short: "Double top plate of the 2×6 bathroom plumbing wall.",
    purpose: "Tie the wet wall to the ceiling plane. Depth matches the 2×6 studs.",
    dependencies: ["assembly.wall.bath.stud.00"],
  });

  addAssembly(reg, {
    id: "assembly.wall.kitchen",
    label: "Kitchen service wall (interior return)",
    trade: "structure",
    center: [2.4, (Y.floorTop + Y.wallTop) / 2, 1.55],
    size: [3.6, Y.wallTop - Y.floorTop, 0.09],
    stage: 8,
    dependencies: ["subfloor.0"],
    explodeVector: [0, 0.4, -1.5],
    short: "Short interior return that helps locate the kitchen run.",
    purpose: "Give kitchen plumbing and electrical a second nailing surface.",
    tags: ["wall", "interior", "kitchen"],
  });

  addBox(reg, {
    id: "assembly.wall.kitchen.plate.bottom",
    type: "bottom-plate",
    label: "Kitchen return bottom plate",
    parentId: "assembly.wall.kitchen",
    trade: "structure",
    center: [2.4, Y.floorTop + P.plate / 2, 1.55],
    size: [3.6, P.plate, LUMBER["2x4"].d],
    material: MAT.wood,
    stage: 8,
    explodeGroup: "assembly.wall.kitchen",
    explodeVector: [0, 0.2, -1.5],
    localExplodeVector: [0, -0.15, 0],
    tags: ["wall", "kitchen"],
    short: "Bottom plate of the kitchen return wall.",
    purpose: "Anchor the kitchen partition to the floor deck.",
    dependencies: ["subfloor.0"],
  });

  const k4 = LUMBER["2x4"];
  let ks = 0;
  for (let x = 2.4 - 1.7; x <= 2.4 + 1.7 + 1e-9; x += P.studOc) {
    const id = `assembly.wall.kitchen.stud.${String(ks).padStart(2, "0")}`;
    addBox(reg, {
      id,
      type: "common-stud",
      label: `Kitchen return stud ${ks + 1}`,
      parentId: "assembly.wall.kitchen",
      trade: "structure",
      center: [x, studY, 1.55],
      size: [k4.t, studH, k4.d],
      material: MAT.wood,
      stage: 8,
      explodeGroup: "assembly.wall.kitchen",
      explodeVector: [0, 0.3, -1.5],
      localExplodeVector: [(x - 2.4) * 0.15, 0, -0.25],
      tags: ["wall", "kitchen"],
      short: "A 2×4 stud in the kitchen return wall.",
      purpose: "Frame the kitchen partition at 16″ o.c. — not a single lumber slab.",
      dependencies: ["assembly.wall.kitchen.plate.bottom"],
    });
    ks += 1;
  }

  addBox(reg, {
    id: "assembly.wall.kitchen.plate.top",
    type: "top-plate",
    label: "Kitchen return top plate",
    parentId: "assembly.wall.kitchen",
    trade: "structure",
    center: [2.4, Y.wallTop - P.plate, 1.55],
    size: [3.6, P.plate * 2, k4.d],
    material: MAT.wood,
    stage: 8,
    explodeGroup: "assembly.wall.kitchen",
    explodeVector: [0, 0.5, -1.5],
    localExplodeVector: [0, 0.25, 0],
    tags: ["wall", "kitchen"],
    short: "Double top plate of the kitchen return.",
    purpose: "Tie the kitchen partition to the ceiling plane.",
    dependencies: ["assembly.wall.kitchen.stud.00"],
  });
}
