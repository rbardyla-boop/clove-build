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
  addAssembly(reg, {
    id: "assembly.wall.bath",
    label: "Bathroom wet wall (interior)",
    trade: "structure",
    center: [bathX, (Y.floorTop + Y.wallTop) / 2, -1.1],
    size: [0.09, Y.wallTop - Y.floorTop, 4.4],
    stage: 8,
    dependencies: ["subfloor.0"],
    explodeVector: [1.6, 0.4, 0],
    short: "Interior partition that hosts the bathroom plumbing wall.",
    purpose: "Create a wet wall cavity for supply, DWV and vent without inventing a second house.",
    tags: ["wall", "interior", "bath"],
  });

  addBox(reg, {
    id: "assembly.wall.bath.plate.bottom",
    type: "bottom-plate",
    label: "Bath wall bottom plate",
    parentId: "assembly.wall.bath",
    trade: "structure",
    center: [bathX, Y.floorTop + P.plate / 2, -1.1],
    size: [P.stud.t, P.plate, 4.4],
    material: MAT.wood,
    stage: 8,
    explodeGroup: "assembly.wall.bath",
    explodeVector: [1.6, 0.2, 0],
    localExplodeVector: [0, -0.2, 0],
    tags: ["wall", "bath"],
    short: "Bottom plate of the bathroom partition.",
    purpose: "Anchor the wet wall to the floor deck.",
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
      size: [P.stud.d, studH, P.stud.t],
      material: MAT.wood,
      stage: 8,
      explodeGroup: "assembly.wall.bath",
      explodeVector: [1.6, 0.3, (i - 3.5) * 0.12],
      localExplodeVector: [0.25, 0, (i - 3.5) * 0.08],
      tags: ["wall", "bath"],
      short: "A 2×4 stud in the bathroom partition.",
      purpose: "Frame the wet wall and leave bays for plumbing.",
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
    size: [P.stud.t, P.plate * 2, 4.4],
    material: MAT.wood,
    stage: 8,
    explodeGroup: "assembly.wall.bath",
    explodeVector: [1.6, 0.55, 0],
    localExplodeVector: [0, 0.3, 0],
    tags: ["wall", "bath"],
    short: "Double top plate of the bathroom partition.",
    purpose: "Tie the wet wall to the ceiling plane.",
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
    id: "assembly.wall.kitchen.stud.00",
    type: "common-stud",
    label: "Kitchen return stud",
    parentId: "assembly.wall.kitchen",
    trade: "structure",
    center: [2.4, studY, 1.55],
    size: [3.4, studH, P.stud.t],
    material: MAT.wood,
    stage: 8,
    explodeGroup: "assembly.wall.kitchen",
    explodeVector: [0, 0.3, -1.5],
    localExplodeVector: [0, 0, -0.25],
    tags: ["wall", "kitchen"],
    short: "Simplified kitchen return framing (one panel, not every stud).",
    purpose: "Hold kitchen devices without duplicating the exterior wall.",
    dependencies: ["subfloor.0"],
  });
}
