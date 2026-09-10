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

export function addFoundation(reg: Registry) {
  const A = "assembly.foundation";
  const down: Vec3 = [0, -1.8, 0];

  reg.add({
    id: A,
    type: "assembly",
    label: "Foundation assembly",
    geometry: { kind: "group", center: [0, -1.1, 0], size: [P.length + 1, 3.2, P.width + 1] },
    material: MAT.concrete,
    assembly: { stage: 3, dependencies: [], explodeGroup: A, explodeVector: [0, 0, 0], localExplodeVector: [0, 0, 0] },
    learning: learn("Concrete footing and basement walls that carry the wood house to soil.", "Create a stable, level base and a frost-protected stem for the wood frame."),
    provenance: PROV_MODEL,
  });

  const soilY = Y.excavBottom - 0.08;
  const pitX = P.length + 1.0;
  const pitZ = P.width + 1.0;
  const ring = 14;
  const slabs: { id: string; c: Vec3; s: Vec3 }[] = [
    { id: "site.grade.n", c: [0, P.grade - 0.04, (pitZ + ring) / 2], s: [pitX + ring * 2, 0.08, ring] },
    { id: "site.grade.s", c: [0, P.grade - 0.04, -(pitZ + ring) / 2], s: [pitX + ring * 2, 0.08, ring] },
    { id: "site.grade.e", c: [(pitX + ring) / 2, P.grade - 0.04, 0], s: [ring, 0.08, pitZ] },
    { id: "site.grade.w", c: [-(pitX + ring) / 2, P.grade - 0.04, 0], s: [ring, 0.08, pitZ] },
  ];
  for (const sl of slabs) {
    reg.add({
      id: sl.id,
      type: "site",
      label: "Finished grade",
      parentId: A,
      geometry: { kind: "box", center: sl.c, size: sl.s },
      material: MAT.grass,
      assembly: { stage: 1, dependencies: [], explodeGroup: A, explodeVector: [0, -0.15, 0], localExplodeVector: [0, -0.15, 0] },
      learning: learn("The reference plane. Everything else is measured from grade.", "Give the house a ground to sit in and a height to measure from."),
      provenance: PROV_MODEL,
      tags: ["site"],
    });
  }

  reg.add({
    id: "exc.floor",
    type: "excavation",
    label: "Excavation floor",
    parentId: A,
    geometry: {
      kind: "box",
      center: [0, soilY, 0],
      size: [pitX, 0.16, pitZ],
    },
    material: MAT.fill,
    assembly: { stage: 2, dependencies: [], explodeGroup: A, explodeVector: [0, -2.4, 0], localExplodeVector: [0, -0.8, 0] },
    learning: learn("The pit the footings sit in. Depth here is a demonstration value, not a frost-depth determination.", "Reach below the footing and give working room around the walls."),
    provenance: PROV_MODEL,
  });

  const wallH = 0.16 + (P.grade - Y.excavBottom);
  const pitHalfX = pitX / 2;
  const pitHalfZ = pitZ / 2;
  const walls = [
    { id: "exc.wall.n", c: [0, (P.grade + Y.excavBottom) / 2, pitHalfZ] as Vec3, s: [pitX, wallH, 0.12] as Vec3 },
    { id: "exc.wall.s", c: [0, (P.grade + Y.excavBottom) / 2, -pitHalfZ] as Vec3, s: [pitX, wallH, 0.12] as Vec3 },
    { id: "exc.wall.e", c: [pitHalfX, (P.grade + Y.excavBottom) / 2, 0] as Vec3, s: [0.12, wallH, pitZ] as Vec3 },
    { id: "exc.wall.w", c: [-pitHalfX, (P.grade + Y.excavBottom) / 2, 0] as Vec3, s: [0.12, wallH, pitZ] as Vec3 },
  ];
  for (const w of walls) {
    reg.add({
      id: w.id,
      type: "excavation",
      label: "Excavation face",
      parentId: A,
      geometry: { kind: "box", center: w.c, size: w.s },
      material: MAT.fill,
      assembly: { stage: 2, dependencies: ["exc.floor"], explodeGroup: A, explodeVector: [0, -2.2, 0], localExplodeVector: [0, -0.7, 0], untilStage: 5 },
      learning: learn("Cut soil around the future foundation.", "Create space for formwork, drainage, and the footing projection."),
      provenance: PROV_MODEL,
    });
  }

  const ftgY = (Y.excavBottom + Y.footingTop) / 2;
  const extra = (P.footingW - P.fdnT) / 2;
  const strips = [
    { id: "ftg.front", label: "Front strip footing", c: [0, ftgY, halfW - P.fdnT / 2] as Vec3, s: [P.length + extra * 2, P.footingT, P.footingW] as Vec3, v: [0, -1.6, 0.6] as Vec3 },
    { id: "ftg.back", label: "Back strip footing", c: [0, ftgY, -halfW + P.fdnT / 2] as Vec3, s: [P.length + extra * 2, P.footingT, P.footingW] as Vec3, v: [0, -1.6, -0.6] as Vec3 },
    { id: "ftg.left", label: "Left strip footing", c: [-halfL + P.fdnT / 2, ftgY, 0] as Vec3, s: [P.footingW, P.footingT, P.width - P.fdnT] as Vec3, v: [-0.6, -1.6, 0] as Vec3 },
    { id: "ftg.right", label: "Right strip footing", c: [halfL - P.fdnT / 2, ftgY, 0] as Vec3, s: [P.footingW, P.footingT, P.width - P.fdnT] as Vec3, v: [0.6, -1.6, 0] as Vec3 },
  ];
  for (const f of strips) {
    reg.add({
      id: f.id,
      type: "footing",
      label: f.label,
      parentId: A,
      geometry: { kind: "box", center: f.c, size: f.s },
      material: MAT.concrete,
      assembly: { stage: 3, dependencies: ["exc.floor"], explodeGroup: A, explodeVector: f.v, localExplodeVector: [f.v[0] * 0.4, f.v[1] * 0.4, f.v[2] * 0.4] },
      structural: { loadPathRole: "spread-foundation-load", required: true },
      learning: learn("A wider concrete strip under the wall so soil pressure stays low.", "Spread wall and house loads onto the ground."),
      provenance: PROV_MODEL,
    });
  }

  const pads = [
    { id: "pad.1", x: -2.4 },
    { id: "pad.2", x: 2.4 },
  ];
  for (const p of pads) {
    reg.add({
      id: p.id,
      type: "pad-footing",
      label: `Interior pad footing ${p.id.slice(-1)}`,
      parentId: A,
      geometry: { kind: "box", center: [p.x, ftgY, 0], size: [0.8, P.footingT, 0.8] },
      material: MAT.concrete,
      assembly: { stage: 3, dependencies: ["exc.floor"], explodeGroup: A, explodeVector: [0, -1.5, 0], localExplodeVector: [0, -0.5, 0] },
      structural: { loadPathRole: "spread-post-load", supports: [`post.${p.id.slice(-1)}`], required: true },
      learning: learn("A pad under each basement post.", "Take concentrated post loads into the soil."),
      provenance: PROV_MODEL,
    });
  }

  const fdnY = (Y.footingTop + Y.fdnTop) / 2;
  const fdnH = Y.fdnTop - Y.footingTop;
  const fdn = [
    { id: "fdn.front", label: "Front foundation wall", c: [0, fdnY, halfW - P.fdnT / 2] as Vec3, s: [P.length, fdnH, P.fdnT] as Vec3, v: [0, -0.7, 0.35] as Vec3, ftg: "ftg.front" },
    { id: "fdn.back", label: "Back foundation wall", c: [0, fdnY, -halfW + P.fdnT / 2] as Vec3, s: [P.length, fdnH, P.fdnT] as Vec3, v: [0, -0.7, -0.35] as Vec3, ftg: "ftg.back" },
    { id: "fdn.left", label: "Left foundation wall", c: [-halfL + P.fdnT / 2, fdnY, 0] as Vec3, s: [P.fdnT, fdnH, P.width - 2 * P.fdnT] as Vec3, v: [-0.35, -0.7, 0] as Vec3, ftg: "ftg.left" },
    { id: "fdn.right", label: "Right foundation wall", c: [halfL - P.fdnT / 2, fdnY, 0] as Vec3, s: [P.fdnT, fdnH, P.width - 2 * P.fdnT] as Vec3, v: [0.35, -0.7, 0] as Vec3, ftg: "ftg.right" },
  ];
  for (const w of fdn) {
    reg.add({
      id: w.id,
      type: "foundation-wall",
      label: w.label,
      parentId: A,
      geometry: { kind: "box", center: w.c, size: w.s },
      material: MAT.concrete,
      assembly: { stage: 4, dependencies: [w.ftg], explodeGroup: A, explodeVector: w.v, localExplodeVector: w.v },
      structural: { loadPathRole: "stem-wall", supportedBy: [w.ftg], required: true },
      learning: learn("The basement wall. It holds back soil and carries the wood frame.", "Lift the wood structure to grade and enclose the basement."),
      provenance: PROV_MODEL,
    });
  }

  const beamBottom = Y.sillTop;
  const postH = beamBottom - Y.footingTop;
  const postY = (Y.footingTop + beamBottom) / 2;
  for (const p of pads) {
    const n = p.id.slice(-1);
    const id = `post.${n}`;
    reg.add({
      id,
      type: "column",
      label: `Basement post ${n}`,
      parentId: A,
      geometry: { kind: "box", center: [p.x, postY, 0], size: [P.post.t, postH, P.post.d] },
      material: MAT.wood,
      assembly: { stage: 4, dependencies: [p.id], explodeGroup: A, explodeVector: [0, 0.2, 0], localExplodeVector: [0, 0.35, 0] },
      structural: {
        loadPathRole: "interior-post",
        supportedBy: [p.id],
        supports: ["beam.center"],
        required: true,
      },
      learning: learn("A wood post carrying the center beam down to a pad.", "Shorten the floor-joist span by supporting the beam."),
      provenance: PROV_MODEL,
    });
  }

  const sills = [
    { id: "sill.front", c: [0, (Y.fdnTop + Y.sillTop) / 2, halfW - P.fdnT / 2] as Vec3, s: [P.length - 0.08, P.plate, P.stud.d] as Vec3, v: [0, -0.25, 0.2] as Vec3, fdn: "fdn.front" },
    { id: "sill.back", c: [0, (Y.fdnTop + Y.sillTop) / 2, -halfW + P.fdnT / 2] as Vec3, s: [P.length - 0.08, P.plate, P.stud.d] as Vec3, v: [0, -0.25, -0.2] as Vec3, fdn: "fdn.back" },
    { id: "sill.left", c: [-halfL + P.fdnT / 2, (Y.fdnTop + Y.sillTop) / 2, 0] as Vec3, s: [P.stud.d, P.plate, P.width - 0.4] as Vec3, v: [-0.2, -0.25, 0] as Vec3, fdn: "fdn.left" },
    { id: "sill.right", c: [halfL - P.fdnT / 2, (Y.fdnTop + Y.sillTop) / 2, 0] as Vec3, s: [P.stud.d, P.plate, P.width - 0.4] as Vec3, v: [0.2, -0.25, 0] as Vec3, fdn: "fdn.right" },
  ];
  for (const s of sills) {
    reg.add({
      id: s.id,
      type: "sill-plate",
      label: `Sill plate (${s.id.split(".")[1]})`,
      parentId: A,
      geometry: { kind: "box", center: s.c, size: s.s },
      material: MAT.treated,
      assembly: { stage: 5, dependencies: [s.fdn], explodeGroup: A, explodeVector: s.v, localExplodeVector: s.v },
      structural: { loadPathRole: "sill", supportedBy: [s.fdn], required: true },
      learning: learn("The first wood member. It is the transition from concrete to framing.", "Bolt the wood house down and give joists a bearing surface. Grade and treatment are not specified in this specimen."),
      provenance: { ...PROV_MODEL, ruleIds: ["DEMO-SILL-001", "LUMBER-GRADE-001"] },
      tags: ["sill"],
    });
  }

  for (const s of sills) {
    const gY = Y.fdnTop + 0.004;
    reg.add({
      id: `${s.id}.gasket`,
      type: "gasket",
      label: `Sill gasket (${s.id.split(".")[1]})`,
      parentId: A,
      geometry: { kind: "box", center: [s.c[0], gY, s.c[2]], size: [s.s[0], 0.008, s.s[2]] },
      material: MAT.poly,
      assembly: { stage: 5, dependencies: [s.fdn], explodeGroup: A, explodeVector: s.v, localExplodeVector: s.v },
      learning: learn(
        "A thin separation layer between concrete and the sill plate.",
        "Capillary break and air seal at the sill. Product and compression are not modelled.",
      ),
      provenance: { ...PROV_MODEL, authority: "TRADE_PRACTICE", status: "demo-only" },
      tags: ["sill", "gasket"],
    });
  }

  const anchors: { id: string; c: Vec3 }[] = [
    { id: "anchor.nw", c: [-halfL + 0.4, Y.fdnTop + 0.04, -halfW + 0.25] },
    { id: "anchor.ne", c: [halfL - 0.4, Y.fdnTop + 0.04, -halfW + 0.25] },
    { id: "anchor.sw", c: [-halfL + 0.4, Y.fdnTop + 0.04, halfW - 0.25] },
    { id: "anchor.se", c: [halfL - 0.4, Y.fdnTop + 0.04, halfW - 0.25] },
  ];
  for (const a of anchors) {
    reg.add({
      id: a.id,
      type: "anchor",
      label: "Sill anchor (representative)",
      parentId: A,
      geometry: { kind: "box", center: a.c, size: [0.04, 0.16, 0.04] },
      material: MAT.steel,
      assembly: { stage: 5, dependencies: ["fdn.front"], explodeGroup: A, explodeVector: [0, -0.2, 0], localExplodeVector: [0, -0.1, 0] },
      learning: learn(
        "A representative sill-to-foundation anchor. Four corners are shown, not the full bolt schedule.",
        "Hold the wood house down. Spacing, embedment and capacity are not verified.",
      ),
      provenance: { ...PROV_MODEL, status: "not-evaluated", authority: "UNKNOWN" },
      tags: ["anchor", "sill"],
    });
  }

  void down;
}
