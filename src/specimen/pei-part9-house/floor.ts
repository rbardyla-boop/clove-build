import type { Vec3 } from "@/crates/building-graph/types";
import { MAT, PROV_MODEL } from "./materials";
import { P, Y, halfL, halfW } from "./params";
import type { Registry } from "./registry";

const learn = (short: string, purpose: string, failureModes: string[] = []) => ({
  shortDescription: short,
  purpose,
  failureModes,
  claimCategory: "educational-simplification" as const,
});

export function addFloor(reg: Registry) {
  const A = "assembly.floor";
  reg.add({
    id: A,
    type: "assembly",
    label: "Floor system",
    geometry: { kind: "group", center: [0, (Y.sillTop + Y.floorTop) / 2, 0], size: [P.length, 0.4, P.width] },
    material: MAT.wood,
    assembly: { stage: 6, dependencies: ["sill.front"], explodeGroup: A, explodeVector: [0, 0, 0], localExplodeVector: [0, 0, 0] },
    learning: learn("Joists, rims, a center beam and subfloor that make the main floor deck.", "Carry occupant and wall loads to the foundation and posts."),
    provenance: PROV_MODEL,
  });

  const t = P.joist.t;
  const d = P.joist.d;
  const beamT = t * 3;
  const joistY = (Y.sillTop + Y.joistTop) / 2;
  const up: Vec3 = [0, 0.55, 0];

  reg.add({
    id: "beam.center",
    type: "beam",
    label: "Center built-up beam (3-ply 2×10)",
    parentId: A,
    geometry: { kind: "box", center: [0, joistY, 0], size: [P.length - 0.35, d, beamT] },
    material: MAT.wood,
    assembly: { stage: 6, dependencies: ["post.1", "post.2", "sill.left"], explodeGroup: A, explodeVector: [0, 0.45, 0], localExplodeVector: [0, 0.55, 0] },
    structural: {
      loadPathRole: "main-beam",
      supportedBy: ["post.1", "post.2"],
      required: true,
    },
    learning: learn("A built-up wood beam down the middle of the house.", "Halve the joist span. Ply count here is a demonstration choice, not a span-table result."),
    provenance: PROV_MODEL,
    tags: ["floor", "beam"],
  });

  const rims = [
    { id: "rim.front", c: [0, joistY, halfW - t / 2] as Vec3, s: [P.length, d, t] as Vec3, v: [0, 0.5, 0.45] as Vec3, dep: "sill.front" },
    { id: "rim.back", c: [0, joistY, -halfW + t / 2] as Vec3, s: [P.length, d, t] as Vec3, v: [0, 0.5, -0.45] as Vec3, dep: "sill.back" },
    { id: "rim.left", c: [-halfL + t / 2, joistY, 0] as Vec3, s: [t, d, P.width - 2 * t] as Vec3, v: [-0.45, 0.5, 0] as Vec3, dep: "sill.left" },
    { id: "rim.right", c: [halfL - t / 2, joistY, 0] as Vec3, s: [t, d, P.width - 2 * t] as Vec3, v: [0.45, 0.5, 0] as Vec3, dep: "sill.right" },
  ];
  for (const r of rims) {
    reg.add({
      id: r.id,
      type: "rim-joist",
      label: `Rim joist (${r.id.split(".")[1]})`,
      parentId: A,
      geometry: { kind: "box", center: r.c, size: r.s },
      material: MAT.wood,
      assembly: { stage: 6, dependencies: [r.dep, "beam.center"], explodeGroup: A, explodeVector: r.v, localExplodeVector: r.v },
      structural: { loadPathRole: "rim", supportedBy: [r.dep], required: true },
      learning: learn("Closes the floor joist bays and ties the deck together at the edge.", "Provide a nailing edge for subfloor and a place for the wall to sit."),
      provenance: PROV_MODEL,
      tags: ["floor"],
    });
  }

  const span = halfW - t - beamT / 2;
  const southLen = span;
  const southZ = beamT / 2 + southLen / 2;
  const northZ = -southZ;
  let n = 0;
  for (let x = -halfL + t + 0.05; x <= halfL - t - 0.05 + 1e-9; x += P.joistOc) {
    const i = String(n).padStart(2, "0");
    for (const side of [
      { id: `joist.s.${i}`, z: southZ, rim: "rim.front" },
      { id: `joist.n.${i}`, z: northZ, rim: "rim.back" },
    ]) {
      const spread = (x / halfL) * 0.35;
      reg.add({
        id: side.id,
        type: "floor-joist",
        label: `Floor joist ${side.id}`,
        parentId: A,
        geometry: { kind: "box", center: [x, joistY, side.z], size: [t, d, southLen] },
        material: MAT.wood,
        assembly: {
          stage: 6,
          dependencies: ["beam.center", side.rim],
          explodeGroup: A,
          explodeVector: [spread, 0.6, side.z > 0 ? 0.25 : -0.25],
          localExplodeVector: [spread * 1.4, 0.25, side.z > 0 ? 0.4 : -0.4],
        },
        structural: {
          loadPathRole: "joist",
          supportedBy: ["beam.center", side.rim],
          required: true,
        },
        learning: learn("A repeating floor member spanning from rim to center beam.", "Carry floor loads to the beam and foundation. Spacing is a demonstration parameter (16″ o.c.)."),
        provenance: { ...PROV_MODEL, ruleIds: ["DEMO-LOADPATH-001"] },
        tags: ["floor", "joist"],
      });
    }
    n += 1;
  }

  const subY = (Y.joistTop + Y.floorTop) / 2;
  const sheetsX = 3;
  const sheetsZ = 2;
  const sx = P.length / sheetsX;
  const sz = P.width / sheetsZ;
  let k = 0;
  for (let ix = 0; ix < sheetsX; ix++) {
    for (let iz = 0; iz < sheetsZ; iz++) {
      const x = -halfL + sx * (ix + 0.5);
      const z = -halfW + sz * (iz + 0.5);
      const id = `subfloor.${k}`;
      reg.add({
        id,
        type: "subfloor",
        label: `Subfloor panel ${k + 1}`,
        parentId: A,
        geometry: { kind: "box", center: [x, subY, z], size: [sx - 0.004, P.subfloor, sz - 0.004] },
        material: MAT.osb,
        assembly: {
          stage: 7,
          dependencies: ["joist.s.00", "joist.n.00"],
          explodeGroup: A,
          explodeVector: [0, 0.95, 0],
          localExplodeVector: [0, 0.7, 0],
        },
        structural: { loadPathRole: "diaphragm", supportedBy: ["joist.s.00"], required: true },
        learning: learn("Wood panels that make a walking surface and tie the joists into a diaphragm.", "Give walls a deck to stand on and spread point loads among joists."),
        provenance: PROV_MODEL,
        tags: ["floor", "sheathing"],
      });
      k += 1;
    }
  }

  void up;
}
