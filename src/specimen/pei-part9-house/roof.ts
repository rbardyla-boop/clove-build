import type { Vec3 } from "@/crates/building-graph/types";
import { MAT, PROV_MODEL } from "./materials";
import { ALPHA, P, Y, halfL, halfW } from "./params";
import type { Registry } from "./registry";

const learn = (short: string, purpose: string, failureModes: string[] = []) => ({
  shortDescription: short,
  purpose,
  failureModes,
  claimCategory: "educational-simplification" as const,
});

export function addRoof(reg: Registry) {
  const A = "assembly.roof";
  const run = halfW + P.overhang;
  const rise = run * P.pitch;
  const rafterLen = Math.hypot(run, rise);
  const tailY = Y.wallTop - P.overhang * P.pitch;
  const southZ = run / 2;
  const northZ = -southZ;
  const southY = (Y.ridgeY + tailY) / 2;
  const northY = southY;

  reg.add({
    id: A,
    type: "assembly",
    label: "Roof assembly",
    geometry: { kind: "group", center: [0, (Y.wallTop + Y.ridgeY) / 2, 0], size: [P.length + 1, rise + 0.4, P.width + P.overhang * 2] },
    material: MAT.wood,
    assembly: { stage: 11, dependencies: ["assembly.wall.front"], explodeGroup: A, explodeVector: [0, 0, 0], localExplodeVector: [0, 0, 0] },
    learning: learn("A simple gable roof: ridge, rafters, ties and sheathing.", "Carry snow and wind (not numerically modelled) to the exterior walls."),
    provenance: PROV_MODEL,
  });

  const ridgeH = P.ridge.d;
  const ridgeT = P.ridge.t;
  reg.add({
    id: "roof.ridge",
    type: "ridge",
    label: "Ridge board",
    parentId: A,
    geometry: { kind: "box", center: [0, Y.ridgeY - ridgeH / 2, 0], size: [P.length + 0.2, ridgeH, ridgeT] },
    material: MAT.wood,
    assembly: { stage: 11, dependencies: ["assembly.wall.front"], explodeGroup: A, explodeVector: [0, 2.6, 0], localExplodeVector: [0, 0.8, 0] },
    structural: { loadPathRole: "ridge", required: true },
    learning: learn("The board at the peak where opposite rafters meet.", "Align rafters. It is not modelled as a girder in this specimen."),
    provenance: PROV_MODEL,
    tags: ["roof"],
  });

  let i = 0;
  for (let x = -halfL + 0.05; x <= halfL - 0.05 + 1e-9; x += P.rafterOc) {
    const idx = String(i).padStart(2, "0");
    const spread = (x / halfL) * 0.2;
    addRafter(reg, A, `rafter.s.${idx}`, x, southY, southZ, rafterLen, ALPHA, [spread, 2.3, 0.55]);
    addRafter(reg, A, `rafter.n.${idx}`, x, northY, northZ, rafterLen, -ALPHA, [spread, 2.3, -0.55]);
    if (i % 3 === 0) {
      const cY = Y.wallTop + (Y.ridgeY - Y.wallTop) * 0.55;
      const cLen = (halfW * 0.9);
      reg.add({
        id: `roof.collar.${idx}`,
        type: "collar-tie",
        label: `Collar tie ${idx}`,
        parentId: A,
        geometry: { kind: "box", center: [x, cY, 0], size: [P.rafter.t, P.rafter.t, cLen] },
        material: MAT.wood,
        assembly: { stage: 11, dependencies: [`rafter.s.${idx}`, `rafter.n.${idx}`], explodeGroup: A, explodeVector: [spread, 2.1, 0], localExplodeVector: [0, 0.35, 0] },
        structural: { loadPathRole: "collar-tie", supportedBy: [`rafter.s.${idx}`, `rafter.n.${idx}`] },
        learning: learn("A tie between a pair of rafters, high in the attic.", "Help keep the pair from spreading. Placement here is a common method, not a code quote."),
        provenance: PROV_MODEL,
        tags: ["roof"],
      });
    }
    i += 1;
  }

  let j = 0;
  for (let x = -halfL + 0.12; x <= halfL - 0.12 + 1e-9; x += P.joistOc) {
    const idx = String(j).padStart(2, "0");
    const cjY = Y.wallTop - P.joist.t / 2;
    reg.add({
      id: `roof.ceiling.${idx}`,
      type: "ceiling-joist",
      label: `Ceiling joist / rafter tie ${idx}`,
      parentId: A,
      geometry: { kind: "box", center: [x, cjY, 0], size: [P.joist.t, P.joist.t, P.width - 0.1] },
      material: MAT.wood,
      assembly: {
        stage: 11,
        dependencies: ["assembly.wall.front", "assembly.wall.back"],
        explodeGroup: A,
        explodeVector: [(x / halfL) * 0.15, 1.85, 0],
        localExplodeVector: [0, 0.2, 0],
      },
      structural: { loadPathRole: "rafter-tie", required: true },
      learning: learn("Joists that also keep the exterior walls from spreading under rafter thrust.", "Tie the eave walls together at plate level."),
      provenance: PROV_MODEL,
      tags: ["roof"],
    });
    j += 1;
  }

  addGableStuds(reg, A, "left", -1);
  addGableStuds(reg, A, "right", 1);

  const sheetAlong = (P.length + 0.3) / 3;
  const sheetRun = rafterLen;
  for (const side of [
    { tag: "s", z: southZ, y: southY, rot: ALPHA },
    { tag: "n", z: northZ, y: northY, rot: -ALPHA },
  ]) {
    for (let k = 0; k < 3; k++) {
      const x = -halfL - 0.15 + sheetAlong * (k + 0.5);
      reg.add({
        id: `roof.sheathing.${side.tag}.${k}`,
        type: "roof-sheathing",
        label: `Roof sheathing ${side.tag.toUpperCase()}${k + 1}`,
        parentId: A,
        geometry: {
          kind: "box",
          center: [x, side.y + 0.08, side.z],
          size: [sheetAlong - 0.01, P.sheathing, sheetRun],
          rotation: [side.rot, 0, 0],
        },
        material: MAT.osb,
        assembly: {
          stage: 12,
          dependencies: ["roof.ridge", "rafter.s.00"],
          explodeGroup: A,
          explodeVector: [0, 3.15, side.z > 0 ? 0.3 : -0.3],
          localExplodeVector: [0, 0.55, side.z > 0 ? 0.35 : -0.35],
        },
        structural: { loadPathRole: "roof-diaphragm" },
        learning: learn("Wood panels on the rafters.", "Make a deck for future roofing and brace the rafters. Roofing is not in v0.1."),
        provenance: { ...PROV_MODEL, ruleIds: ["NBC-SNOW-001"] },
        tags: ["roof", "sheathing"],
      });
    }
  }
}

function addRafter(
  reg: Registry,
  A: string,
  id: string,
  x: number,
  y: number,
  z: number,
  len: number,
  rot: number,
  explode: Vec3,
) {
  const t = P.rafter.t;
  const d = P.rafter.d;
  reg.add({
    id,
    type: "rafter",
    label: `Rafter ${id.replace("rafter.", "")}`,
    parentId: A,
    geometry: {
      kind: "box",
      center: [x, y, z],
      size: [t, d, len],
      rotation: [rot, 0, 0],
    },
    material: MAT.wood,
    assembly: {
      stage: 11,
      dependencies: ["roof.ridge", "assembly.wall.front"],
      explodeGroup: A,
      explodeVector: explode,
      localExplodeVector: [explode[0] * 0.6, 0.4, explode[2]],
    },
    structural: { loadPathRole: "rafter", supportedBy: ["roof.ridge"], required: true },
    learning: learn("A sloping roof member from ridge to wall plate, with a short overhang.", "Carry roof loads to the exterior walls. Size and spacing are demonstration values — climatic snow load is not in this model."),
    provenance: { ...PROV_MODEL, ruleIds: ["NBC-SNOW-001"] },
    tags: ["roof", "rafter"],
  });
}

function addGableStuds(reg: Registry, A: string, side: "left" | "right", sign: number) {
  const x = sign * (halfL - P.stud.d / 2 - P.sheathing);
  let n = 0;
  for (let z = -halfW + 0.3; z <= halfW - 0.3 + 1e-9; z += P.studOc) {
    const run = Math.abs(z);
    const peak = (halfW - run) * P.pitch;
    if (peak < 0.18) continue;
    const h = peak;
    const y = Y.wallTop + h / 2;
    const id = `roof.gable.${side}.${n}`;
    reg.add({
      id,
      type: "gable-stud",
      label: `${cap(side)} gable stud ${n}`,
      parentId: A,
      geometry: { kind: "box", center: [x, y, z], size: [P.stud.d, h, P.stud.t] },
      material: MAT.wood,
      assembly: {
        stage: 11,
        dependencies: [`assembly.wall.${side}`],
        explodeGroup: A,
        explodeVector: [sign * 2.2, 2.0, z * 0.08],
        localExplodeVector: [sign * 0.35, 0.25, 0],
      },
      structural: { loadPathRole: "gable-stud" },
      learning: learn("Short studs that infill the triangular gable above the end-wall plates.", "Give the gable sheathing something to nail to."),
      provenance: PROV_MODEL,
      tags: ["roof", "gable"],
    });
    n += 1;
  }
}

function cap(s: string): string {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}
