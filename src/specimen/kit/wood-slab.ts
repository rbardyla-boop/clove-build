import type {
  Attachment,
  BuildingGraph,
  ComponentType,
  LinearRun,
  MaterialDescriptor,
  Relation,
  SystemGraph,
  TradeId,
  Vec3,
} from "@/crates/building-graph/types";
import { LUMBER, SHEATHING_OSB } from "@/crates/geometry/lumber";
import { linearRun, slopedDrain } from "@/crates/geometry/run";
import { siteFacts } from "@/crates/site/facts";
import { addAssembly, addBox, MAT, PROV_EDU, PROV_MODEL, PROV_SCIENCE, segmentBox } from "../pei-part9-house/helper";
import { createRegistry, type Registry } from "../pei-part9-house/registry";

export type WallKey = "front" | "back" | "left" | "right";

export type KitOpening = {
  wall: WallKey;
  id: string;
  kind: "window" | "door";
  s: number;
  w: number;
  h: number;
  sill: number;
};

export type HouseDims = {
  L: number;
  W: number;
  hL: number;
  hW: number;
  grade: number;
  floorTop: number;
  plate: number;
  studH: number;
  wallTop: number;
  pitch: number;
  overhang: number;
  alpha: number;
  ridgeY: number;
  studOc: number;
  rafterOc: number;
  stud: { t: number; d: number };
  rafter: { t: number; d: number };
  header: { t: number; d: number };
  sheathing: number;
};

export type WoodSlabOptions = {
  id: string;
  title: string;
  L: number;
  W: number;
  pitch?: number;
  overhang?: number;
  openings: KitOpening[];
  kitchen: { x: number; z: number };
  bath: { x: number; z: number };
  stack: { x: number; z: number };
  heater: { x: number; z: number };
  panel: { x: number; z: number };
  indoorHead: { x: number; z: number };
  outdoorUnit: { x: number; z: number };
};

export type KitBuild = {
  reg: Registry;
  dims: HouseDims;
  systems: SystemGraph[];
  relations: Relation[];
  attachments: Attachment[];
};

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function makeDims(L: number, W: number, pitch = 4 / 12, overhang = 0.4): HouseDims {
  const plate = LUMBER["2x6"].t;
  const studH = 2.362;
  const floorTop = 0.18;
  const wallTop = floorTop + plate + studH + plate * 2;
  const hW = W / 2;
  return {
    L,
    W,
    hL: L / 2,
    hW,
    grade: 0,
    floorTop,
    plate,
    studH,
    wallTop,
    pitch,
    overhang,
    alpha: Math.atan(pitch),
    ridgeY: wallTop + hW * pitch,
    studOc: 0.406,
    rafterOc: 0.406,
    stud: LUMBER["2x6"],
    rafter: LUMBER["2x8"],
    header: LUMBER["2x10"],
    sheathing: SHEATHING_OSB,
  };
}

function wallGeom(d: HouseDims, key: WallKey) {
  const t = d.stud.t;
  const dep = d.stud.d;
  if (key === "front" || key === "back") {
    const sign = key === "front" ? 1 : -1;
    return {
      length: d.L,
      outward: [0, 0, sign] as Vec3,
      lumber: (along: number, y: number, depth: number): Vec3 => [along, y, depth],
      at: (s: number, inset: number) => ({ x: s, z: sign * (d.hW - inset) }),
    };
  }
  const sign = key === "right" ? 1 : -1;
  return {
    length: d.W,
    outward: [sign, 0, 0] as Vec3,
    lumber: (along: number, y: number, depth: number): Vec3 => [depth, y, along],
    at: (s: number, inset: number) => ({ x: sign * (d.hL - inset), z: s }),
  };
}

function openingHit(s: number, t: number, openings: KitOpening[]): KitOpening | undefined {
  const half = t / 2 + 0.002;
  for (const o of openings) {
    const kit = o.w / 2 + t * 2.2;
    if (s + half > o.s - kit && s - half < o.s + kit) return o;
  }
  return undefined;
}

export function addSiteAndSlab(reg: Registry, d: HouseDims) {
  addAssembly(reg, {
    id: "assembly.foundation",
    label: "Slab on grade",
    trade: "foundation",
    center: [0, 0.08, 0],
    size: [d.L + 0.8, 0.5, d.W + 0.8],
    stage: 4,
    explodeVector: [0, -0.7, 0],
    short: "A thickened-edge slab. There is no basement.",
    purpose: "Carry the wood house on grade. Thickness and reinforcing are demonstration values, not a structural design.",
    tags: ["foundation", "slab"],
  });
  addBox(reg, {
    id: "site.grade",
    type: "site",
    label: "Finished grade",
    parentId: "assembly.foundation",
    trade: "foundation",
    center: [0, -0.04, 0],
    size: [d.L + 3.2, 0.08, d.W + 3.2],
    material: MAT.grass,
    stage: 1,
    explodeGroup: "assembly.foundation",
    explodeVector: [0, -0.25, 0],
    tags: ["site"],
    short: "The ground around this cottage.",
    purpose: "Site context. Sized to the dwelling, not an empty field.",
  });
  addBox(reg, {
    id: "foundation.base",
    type: "compacted-base",
    label: "Compacted granular base",
    parentId: "assembly.foundation",
    trade: "foundation",
    center: [0, -0.14, 0],
    size: [d.L + 0.7, 0.18, d.W + 0.7],
    material: MAT.fill,
    stage: 3,
    explodeGroup: "assembly.foundation",
    explodeVector: [0, -0.45, 0],
    tags: ["foundation", "base"],
    short: "Granular fill under the slab.",
    purpose: "A project-model base. Compaction and drainage are not verified.",
    provenance: PROV_MODEL,
  });
  addBox(reg, {
    id: "foundation.slab.vapour",
    type: "vapour-barrier",
    label: "Under-slab vapour barrier",
    parentId: "assembly.foundation",
    trade: "thermal",
    center: [0, 0.055, 0],
    size: [d.L + 0.2, 0.002, d.W + 0.2],
    material: MAT.poly,
    stage: 4,
    explodeGroup: "assembly.foundation",
    explodeVector: [0, -0.55, 0],
    tags: ["thermal", "vapour"],
    short: "A polyethylene sheet under the slab.",
    purpose: "Building-science control layer. Product and lapping are not specified.",
    provenance: PROV_SCIENCE,
  });
  addBox(reg, {
    id: "foundation.slab.insulation",
    type: "insulation",
    label: "Under-slab insulation",
    parentId: "assembly.foundation",
    trade: "thermal",
    center: [0, 0.03, 0],
    size: [d.L - 0.4, 0.05, d.W - 0.4],
    material: MAT.insulation,
    stage: 4,
    explodeGroup: "assembly.foundation",
    explodeVector: [0, -0.5, 0],
    tags: ["thermal"],
    short: "Rigid insulation under the slab field.",
    purpose: "A thermal-control concept. R-value and frost protection are not claimed.",
    provenance: PROV_SCIENCE,
  });
  addBox(reg, {
    id: "slab.grade",
    type: "slab",
    label: "Slab on grade",
    parentId: "assembly.foundation",
    trade: "foundation",
    center: [0, 0.12, 0],
    size: [d.L + 0.2, 0.12, d.W + 0.2],
    material: MAT.concrete,
    stage: 4,
    explodeGroup: "assembly.foundation",
    explodeVector: [0, -0.6, 0],
    tags: ["foundation", "slab"],
    short: "The floor and foundation of this cottage.",
    purpose: "Carry wall loads into the thickened edge. Reinforcing is not modelled.",
  });
  const edgeT = 0.42;
  const edgeY = 0.18 - edgeT / 2;
  const edges: { id: string; c: Vec3; s: Vec3 }[] = [
    { id: "front", c: [0, edgeY, d.hW + 0.05], s: [d.L + 0.4, edgeT, 0.4] },
    { id: "back", c: [0, edgeY, -d.hW - 0.05], s: [d.L + 0.4, edgeT, 0.4] },
    { id: "left", c: [-d.hL - 0.05, edgeY, 0], s: [0.4, edgeT, d.W - 0.4] },
    { id: "right", c: [d.hL + 0.05, edgeY, 0], s: [0.4, edgeT, d.W - 0.4] },
  ];
  for (const e of edges) {
    addBox(reg, {
      id: `slab.edge.${e.id}`,
      type: "slab",
      label: `Thickened slab edge (${e.id})`,
      parentId: "assembly.foundation",
      trade: "foundation",
      center: e.c,
      size: e.s,
      material: MAT.concrete,
      stage: 4,
      explodeGroup: "assembly.foundation",
      explodeVector: [0, -0.65, 0],
      tags: ["foundation", "thickened-edge"],
      short: "A deeper concrete edge under the wall line.",
      purpose: "Project-model thickened edge. Frost depth is not verified for PEI.",
    });
  }
  const corners: [string, Vec3][] = [
    ["nw", [-d.hL + 0.2, d.floorTop + 0.02, -d.hW + 0.2]],
    ["ne", [d.hL - 0.2, d.floorTop + 0.02, -d.hW + 0.2]],
    ["sw", [-d.hL + 0.2, d.floorTop + 0.02, d.hW - 0.2]],
    ["se", [d.hL - 0.2, d.floorTop + 0.02, d.hW - 0.2]],
  ];
  for (const [id, c] of corners) {
    addBox(reg, {
      id: `anchor.${id}`,
      type: "anchor",
      label: `Slab anchor ${id.toUpperCase()}`,
      parentId: "assembly.foundation",
      trade: "foundation",
      center: c,
      size: [0.02, 0.16, 0.02],
      material: MAT.steel,
      stage: 8,
      explodeGroup: "assembly.foundation",
      explodeVector: [0, 0.2, 0],
      tags: ["anchor"],
      short: "A representative anchor bolt at a corner.",
      purpose: "Show the wood wall is tied to the slab. Spacing and embedment are not a design.",
    });
  }
}

export function addFramedWalls(reg: Registry, d: HouseDims, openings: KitOpening[]) {
  const t = d.stud.t;
  const dep = d.stud.d;
  const studInset = d.sheathing + dep / 2;
  const plateH = d.plate;
  const bottomY = d.floorTop + plateH / 2;
  const studY = d.floorTop + plateH + d.studH / 2;
  const innerTopY = d.floorTop + plateH + d.studH + plateH / 2;
  const outerTopY = innerTopY + plateH;
  const walls: WallKey[] = ["front", "back", "left", "right"];

  for (const key of walls) {
    const g = wallGeom(d, key);
    const A = `assembly.wall.${key}`;
    const wallOpenings = openings.filter((o) => o.wall === key);
    addAssembly(reg, {
      id: A,
      label: `${cap(key)} exterior wall`,
      trade: "structure",
      center: key === "front" || key === "back" ? [0, (d.floorTop + d.wallTop) / 2, g.at(0, studInset).z] : [g.at(0, studInset).x, (d.floorTop + d.wallTop) / 2, 0],
      size: g.lumber(g.length, d.wallTop - d.floorTop, 0.3),
      stage: 8,
      dependencies: ["slab.grade"],
      explodeVector: [g.outward[0] * 1.6, 0.15, g.outward[2] * 1.6],
      short: `Wood-framed ${key} wall with plates, studs and openings.`,
      purpose: "Carry roof loads, define openings, and receive sheathing.",
      tags: ["wall", key],
    });

    const p0 = g.at(0, studInset);
    for (const plate of [
      { id: `${A}.plate.bottom`, type: "bottom-plate" as const, y: bottomY, label: `${cap(key)} bottom plate` },
      { id: `${A}.plate.top.inner`, type: "top-plate" as const, y: innerTopY, label: `${cap(key)} inner top plate` },
      { id: `${A}.plate.top.outer`, type: "top-plate" as const, y: outerTopY, label: `${cap(key)} outer top plate` },
    ]) {
      addBox(reg, {
        id: plate.id,
        type: plate.type,
        label: plate.label,
        parentId: A,
        trade: "structure",
        center: [p0.x, plate.y, p0.z],
        size: g.lumber(g.length, plateH, dep),
        material: plate.type === "bottom-plate" ? MAT.treated : MAT.wood,
        stage: 8,
        explodeGroup: A,
        explodeVector: [g.outward[0] * 1.6, plate.type === "bottom-plate" ? -0.15 : 0.4, g.outward[2] * 1.6],
        tags: ["wall", key],
        short: plate.type === "bottom-plate" ? "Treated plate on the slab." : "A doubled top plate.",
        purpose: "Tie the wall into a single assembly.",
        dependencies: ["slab.grade"],
      });
    }
    addBox(reg, {
      id: `${A}.gasket`,
      type: "gasket",
      label: `${cap(key)} sill gasket`,
      parentId: A,
      trade: "foundation",
      center: [p0.x, d.floorTop + 0.003, p0.z],
      size: g.lumber(g.length, 0.006, dep),
      material: MAT.poly,
      stage: 8,
      explodeGroup: A,
      explodeVector: [g.outward[0] * 1.4, -0.2, g.outward[2] * 1.4],
      tags: ["gasket", key],
      short: "A capillary break under the bottom plate.",
      purpose: "Keep the wood off the slab. Product is unspecified.",
      provenance: PROV_SCIENCE,
    });

    const start = -g.length / 2 + t / 2;
    const end = g.length / 2 - t / 2;
    let i = 0;
    for (let s = start; s <= end + 1e-9; s += d.studOc) {
      if (openingHit(s, t, wallOpenings)) continue;
      const pos = g.at(s, studInset);
      addBox(reg, {
        id: `${A}.stud.${String(i).padStart(2, "0")}`,
        type: "common-stud",
        label: `${cap(key)} stud`,
        parentId: A,
        trade: "structure",
        center: [pos.x, studY, pos.z],
        size: g.lumber(t, d.studH, dep),
        material: MAT.wood,
        stage: 8,
        explodeGroup: A,
        explodeVector: [g.outward[0] * 1.6, 0.1, g.outward[2] * 1.6],
        tags: ["wall", key],
        short: "A common stud in this wall.",
        purpose: "Carry vertical load and receive sheathing.",
        dependencies: [`${A}.plate.bottom`],
      });
      i += 1;
    }

    for (const o of wallOpenings) {
      const kingOff = o.w / 2 + t * 1.5;
      const jackOff = o.w / 2 + t * 0.5;
      for (const [side, off, role] of [
        ["l", -kingOff, "king-stud"],
        ["r", kingOff, "king-stud"],
        ["l", -jackOff, "jack-stud"],
        ["r", jackOff, "jack-stud"],
      ] as const) {
        const pos = g.at(o.s + off, studInset);
        const isJack = role === "jack-stud";
        const headerSoffit = d.floorTop + plateH + o.sill + o.h;
        const jackH = isJack ? headerSoffit - (d.floorTop + plateH) : d.studH;
        const jackY = isJack ? d.floorTop + plateH + jackH / 2 : studY;
        addBox(reg, {
          id: `${A}.${o.id}.${role}.${side}`,
          type: role,
          label: `${o.id} ${role.replace("-", " ")}`,
          parentId: A,
          trade: "structure",
          center: [pos.x, jackY, pos.z],
          size: g.lumber(t, jackH, dep),
          material: MAT.wood,
          stage: 8,
          explodeGroup: A,
          explodeVector: [g.outward[0] * 1.7, 0.15, g.outward[2] * 1.7],
          tags: ["wall", key, "opening"],
          short: isJack ? "Supports the header." : "Full-height stud beside the opening.",
          purpose: "Frame the opening. Header design is not a span table.",
        });
      }
      const headerY = d.floorTop + plateH + o.sill + o.h + d.header.d / 2;
      const hpos = g.at(o.s, studInset);
      addBox(reg, {
        id: `${A}.${o.id}.header`,
        type: "header",
        label: `${o.id} header`,
        parentId: A,
        trade: "structure",
        center: [hpos.x, headerY, hpos.z],
        size: g.lumber(o.w + 2 * t, d.header.d, dep),
        material: MAT.wood,
        stage: 8,
        explodeGroup: A,
        explodeVector: [g.outward[0] * 1.8, 0.25, g.outward[2] * 1.8],
        tags: ["wall", key, "opening"],
        short: "A built-up header over the opening.",
        purpose: "Carry loads around the opening. Ply count is demonstration-only.",
      });
      if (o.kind === "window") {
        const sillY = d.floorTop + plateH + o.sill - t / 2;
        addBox(reg, {
          id: `${A}.${o.id}.sill`,
          type: "rough-sill",
          label: `${o.id} rough sill`,
          parentId: A,
          trade: "structure",
          center: [hpos.x, sillY, hpos.z],
          size: g.lumber(o.w, t, dep),
          material: MAT.wood,
          stage: 8,
          explodeGroup: A,
          explodeVector: [g.outward[0] * 1.7, 0.05, g.outward[2] * 1.7],
          tags: ["wall", key, "opening"],
          short: "The rough sill of the window opening.",
          purpose: "Receive the window unit.",
        });
      }
      const unitY = d.floorTop + plateH + o.sill + o.h / 2;
      const unitPos = g.at(o.s, 0.02);
      addBox(reg, {
        id: `envelope.${o.kind}.${o.id}`,
        type: o.kind === "window" ? "window-unit" : "door-unit",
        label: o.kind === "window" ? `Window ${o.id}` : `Door ${o.id}`,
        parentId: A,
        trade: "envelope",
        center: [unitPos.x, unitY, unitPos.z],
        size: g.lumber(o.w, o.h, 0.1),
        material: o.kind === "window" ? MAT.glass : MAT.wood,
        stage: 13,
        explodeGroup: A,
        explodeVector: [g.outward[0] * 2.0, 0.2, g.outward[2] * 2.0],
        tags: ["envelope", o.kind, key],
        short: o.kind === "window" ? "A complete window unit in a framed opening." : "A complete door unit in a framed opening.",
        purpose: "Close the opening. Flashing is simplified.",
        dependencies: [`${A}.${o.id}.header`],
      });
    }

    const sheathPos = g.at(0, d.sheathing / 2);
    addBox(reg, {
      id: `${A}.sheathing`,
      type: "wall-sheathing",
      label: `${cap(key)} wall sheathing`,
      parentId: A,
      trade: "structure",
      center: [sheathPos.x, (d.floorTop + d.wallTop) / 2, sheathPos.z],
      size: g.lumber(g.length, d.wallTop - d.floorTop, d.sheathing),
      material: MAT.osb,
      stage: 9,
      explodeGroup: A,
      explodeVector: [g.outward[0] * 1.9, 0.1, g.outward[2] * 1.9],
      tags: ["sheathing", key],
      short: "Wood structural panel on the outside of the studs.",
      purpose: "Brace the wall and receive the WRB.",
      dependencies: [A],
    });
  }
}

export function addRoof(reg: Registry, d: HouseDims) {
  const A = "assembly.roof";
  const run = d.hW + d.overhang;
  const rise = run * d.pitch;
  const rafterLen = Math.hypot(run, rise);
  const tailY = d.wallTop - d.overhang * d.pitch;
  const southZ = run / 2;
  const southY = (d.ridgeY + tailY) / 2;
  addAssembly(reg, {
    id: A,
    label: "Roof assembly",
    trade: "structure",
    center: [0, (d.wallTop + d.ridgeY) / 2, 0],
    size: [d.L + 1, rise + 0.5, d.W + d.overhang * 2],
    stage: 11,
    dependencies: ["assembly.wall.front", "assembly.wall.back"],
    explodeVector: [0, 1.4, 0],
    short: "A gable roof: ridge, rafters, ties, sheathing.",
    purpose: "Carry snow and wind (not numerically modelled) to the exterior walls.",
    tags: ["roof"],
  });
  addBox(reg, {
    id: "roof.ridge",
    type: "ridge",
    label: "Ridge board",
    parentId: A,
    trade: "structure",
    center: [0, d.ridgeY - d.rafter.d / 2, 0],
    size: [d.L + 0.2, d.header.d, d.rafter.t],
    material: MAT.wood,
    stage: 11,
    explodeGroup: A,
    explodeVector: [0, 2.4, 0],
    tags: ["roof"],
    short: "The board at the peak where opposite rafters meet.",
    purpose: "Align rafters. It is not modelled as a girder.",
  });
  let i = 0;
  for (let x = -d.hL + 0.05; x <= d.hL - 0.05 + 1e-9; x += d.rafterOc) {
    const idx = String(i).padStart(2, "0");
    const spread = (x / d.hL) * 0.18;
    addBox(reg, {
      id: `rafter.s.${idx}`,
      type: "rafter",
      label: `South rafter ${idx}`,
      parentId: A,
      trade: "structure",
      center: [x, southY, southZ],
      size: [d.rafter.t, d.rafter.d, rafterLen],
      rotation: [d.alpha, 0, 0],
      material: MAT.wood,
      stage: 11,
      explodeGroup: A,
      explodeVector: [spread, 2.2, 0.5],
      tags: ["roof", "rafter"],
      short: "A south-slope rafter bearing on the front wall.",
      purpose: "Span from ridge to wall. Birdsmouth is not modelled.",
      dependencies: ["roof.ridge", "assembly.wall.front"],
    });
    addBox(reg, {
      id: `rafter.n.${idx}`,
      type: "rafter",
      label: `North rafter ${idx}`,
      parentId: A,
      trade: "structure",
      center: [x, southY, -southZ],
      size: [d.rafter.t, d.rafter.d, rafterLen],
      rotation: [-d.alpha, 0, 0],
      material: MAT.wood,
      stage: 11,
      explodeGroup: A,
      explodeVector: [spread, 2.2, -0.5],
      tags: ["roof", "rafter"],
      short: "A north-slope rafter bearing on the back wall.",
      purpose: "Span from ridge to wall.",
      dependencies: ["roof.ridge", "assembly.wall.back"],
    });
    if (i % 3 === 0) {
      addBox(reg, {
        id: `roof.collar.${idx}`,
        type: "collar-tie",
        label: `Collar tie ${idx}`,
        parentId: A,
        trade: "structure",
        center: [x, d.wallTop + (d.ridgeY - d.wallTop) * 0.5, 0],
        size: [d.rafter.t, d.rafter.t, d.hW * 0.9],
        material: MAT.wood,
        stage: 11,
        explodeGroup: A,
        explodeVector: [spread, 2.0, 0],
        tags: ["roof"],
        short: "A tie between a pair of rafters.",
        purpose: "Help keep the pair from spreading.",
        dependencies: [`rafter.s.${idx}`, `rafter.n.${idx}`],
      });
    }
    addBox(reg, {
      id: `roof.ceiling.${idx}`,
      type: "ceiling-joist",
      label: `Ceiling joist ${idx}`,
      parentId: A,
      trade: "structure",
      center: [x, d.wallTop - 0.02, 0],
      size: [d.rafter.t, LUMBER["2x6"].d, d.W - 0.2],
      material: MAT.wood,
      stage: 11,
      explodeGroup: A,
      explodeVector: [spread, 1.6, 0],
      tags: ["roof", "ceiling"],
      short: "A ceiling joist tying the exterior walls.",
      purpose: "Resist rafter thrust and carry ceiling finish.",
      dependencies: ["assembly.wall.front", "assembly.wall.back"],
    });
    i += 1;
  }
  const sheathLen = rafterLen;
  addBox(reg, {
    id: "roof.sheathing.s",
    type: "roof-sheathing",
    label: "South roof sheathing",
    parentId: A,
    trade: "structure",
    center: [0, southY + 0.1, southZ],
    size: [d.L + 0.35, d.sheathing, sheathLen],
    rotation: [d.alpha, 0, 0],
    material: MAT.osb,
    stage: 12,
    explodeGroup: A,
    explodeVector: [0, 2.5, 0.6],
    tags: ["roof", "sheathing"],
    short: "Structural panel on the south rafters.",
    purpose: "A nailing surface for underlayment. It sits on the rafters, not in the air.",
    dependencies: ["rafter.s.00"],
  });
  addBox(reg, {
    id: "roof.sheathing.n",
    type: "roof-sheathing",
    label: "North roof sheathing",
    parentId: A,
    trade: "structure",
    center: [0, southY + 0.1, -southZ],
    size: [d.L + 0.35, d.sheathing, sheathLen],
    rotation: [-d.alpha, 0, 0],
    material: MAT.osb,
    stage: 12,
    explodeGroup: A,
    explodeVector: [0, 2.5, -0.6],
    tags: ["roof", "sheathing"],
    short: "Structural panel on the north rafters.",
    purpose: "Close the north slope.",
    dependencies: ["rafter.n.00"],
  });
  addBox(reg, {
    id: "roof.underlayment.s",
    type: "underlayment",
    label: "South roof underlayment",
    parentId: A,
    trade: "envelope",
    center: [0, southY + 0.12, southZ],
    size: [d.L + 0.38, 0.004, sheathLen + 0.02],
    rotation: [d.alpha, 0, 0],
    material: MAT.felt,
    stage: 13,
    explodeGroup: A,
    explodeVector: [0, 2.65, 0.7],
    tags: ["envelope", "roof"],
    short: "Underlayment on the south slope.",
    purpose: "Backup water control under the covering.",
    provenance: PROV_SCIENCE,
  });
  addBox(reg, {
    id: "roof.underlayment.n",
    type: "underlayment",
    label: "North roof underlayment",
    parentId: A,
    trade: "envelope",
    center: [0, southY + 0.12, -southZ],
    size: [d.L + 0.38, 0.004, sheathLen + 0.02],
    rotation: [-d.alpha, 0, 0],
    material: MAT.felt,
    stage: 13,
    explodeGroup: A,
    explodeVector: [0, 2.65, -0.7],
    tags: ["envelope", "roof"],
    short: "Underlayment on the north slope.",
    purpose: "Backup water control.",
    provenance: PROV_SCIENCE,
  });
  addBox(reg, {
    id: "roof.covering.s",
    type: "roof-covering",
    label: "South asphalt shingles",
    parentId: A,
    trade: "envelope",
    center: [0, southY + 0.14, southZ],
    size: [d.L + 0.4, 0.012, sheathLen + 0.04],
    rotation: [d.alpha, 0, 0],
    material: MAT.shingle,
    stage: 14,
    explodeGroup: A,
    explodeVector: [0, 2.85, 0.8],
    tags: ["envelope", "roof"],
    short: "Finished covering on the south slope.",
    purpose: "The primary roof water-shedding surface.",
    dependencies: ["roof.underlayment.s"],
  });
  addBox(reg, {
    id: "roof.covering.n",
    type: "roof-covering",
    label: "North asphalt shingles",
    parentId: A,
    trade: "envelope",
    center: [0, southY + 0.14, -southZ],
    size: [d.L + 0.4, 0.012, sheathLen + 0.04],
    rotation: [-d.alpha, 0, 0],
    material: MAT.shingle,
    stage: 14,
    explodeGroup: A,
    explodeVector: [0, 2.85, -0.8],
    tags: ["envelope", "roof"],
    short: "Finished covering on the north slope.",
    purpose: "Close the north slope.",
    dependencies: ["roof.underlayment.n"],
  });
  addBox(reg, {
    id: "roof.fascia.s",
    type: "fascia",
    label: "South fascia",
    parentId: A,
    trade: "envelope",
    center: [0, tailY, d.hW + d.overhang],
    size: [d.L + 0.5, 0.18, 0.025],
    material: MAT.wood,
    stage: 12,
    explodeGroup: A,
    explodeVector: [0, 2.3, 1.0],
    tags: ["envelope", "eave"],
    short: "Fascia at the south eave.",
    purpose: "Close the rafter tails.",
  });
  addBox(reg, {
    id: "roof.fascia.n",
    type: "fascia",
    label: "North fascia",
    parentId: A,
    trade: "envelope",
    center: [0, tailY, -d.hW - d.overhang],
    size: [d.L + 0.5, 0.18, 0.025],
    material: MAT.wood,
    stage: 12,
    explodeGroup: A,
    explodeVector: [0, 2.3, -1.0],
    tags: ["envelope", "eave"],
    short: "Fascia at the north eave.",
    purpose: "Close the rafter tails.",
  });
}

export function addEnvelopeAndFinish(reg: Registry, d: HouseDims) {
  addAssembly(reg, {
    id: "assembly.envelope",
    label: "Exterior envelope",
    trade: "envelope",
    center: [0, (d.floorTop + d.ridgeY) / 2, 0],
    size: [d.L + 0.5, d.ridgeY - d.floorTop, d.W + 0.5],
    stage: 13,
    dependencies: ["assembly.wall.front"],
    explodeVector: [0, 0.2, 0],
    short: "Water-control and cladding layers over the wood frame.",
    purpose: "Dry the building in.",
    tags: ["envelope"],
  });
  const walls: { key: WallKey; center: Vec3; size: Vec3; out: Vec3 }[] = [
    { key: "front", center: [0, (d.floorTop + d.wallTop) / 2, d.hW + 0.02], size: [d.L, d.wallTop - d.floorTop, 0.01], out: [0, 0.15, 2.1] },
    { key: "back", center: [0, (d.floorTop + d.wallTop) / 2, -d.hW - 0.02], size: [d.L, d.wallTop - d.floorTop, 0.01], out: [0, 0.15, -2.1] },
    { key: "left", center: [-d.hL - 0.02, (d.floorTop + d.wallTop) / 2, 0], size: [0.01, d.wallTop - d.floorTop, d.W], out: [-2.1, 0.15, 0] },
    { key: "right", center: [d.hL + 0.02, (d.floorTop + d.wallTop) / 2, 0], size: [0.01, d.wallTop - d.floorTop, d.W], out: [2.1, 0.15, 0] },
  ];
  for (const w of walls) {
    addBox(reg, {
      id: `envelope.wall.${w.key}.wrb`,
      type: "wrb",
      label: `${cap(w.key)} water-resistive barrier`,
      parentId: `assembly.wall.${w.key}`,
      trade: "envelope",
      center: w.center,
      size: w.size,
      material: MAT.wrap,
      stage: 13,
      explodeGroup: `assembly.wall.${w.key}`,
      explodeVector: w.out,
      tags: ["envelope", "water-control", w.key],
      short: "WRB over sheathing.",
      purpose: "Shed bulk water that gets past cladding.",
      provenance: PROV_SCIENCE,
    });
    const cladC: Vec3 = [
      w.center[0] + Math.sign(w.out[0]) * 0.016,
      w.center[1],
      w.center[2] + Math.sign(w.out[2]) * 0.016,
    ];
    const cladS: Vec3 = [
      w.key === "left" || w.key === "right" ? 0.014 : w.size[0],
      w.size[1],
      w.key === "front" || w.key === "back" ? 0.014 : w.size[2],
    ];
    addBox(reg, {
      id: `envelope.wall.${w.key}.cladding`,
      type: "cladding",
      label: `${cap(w.key)} cladding`,
      parentId: `assembly.wall.${w.key}`,
      trade: "envelope",
      center: cladC,
      size: cladS,
      material: MAT.cladding,
      stage: 14,
      explodeGroup: `assembly.wall.${w.key}`,
      explodeVector: [w.out[0] * 1.15, w.out[1], w.out[2] * 1.15],
      tags: ["envelope", "cladding", w.key],
      short: "Lap siding as a rainscreen cladding concept.",
      purpose: "The exterior finish. Drainage space is simplified.",
      provenance: PROV_SCIENCE,
      dependencies: [`envelope.wall.${w.key}.wrb`],
    });
    addBox(reg, {
      id: `thermal.wall.${w.key}.batt`,
      type: "insulation",
      label: `${cap(w.key)} batt insulation`,
      parentId: `assembly.wall.${w.key}`,
      trade: "thermal",
      center: wallGeom(d, w.key).at(0, d.sheathing + d.stud.d / 2).x !== undefined
        ? [wallGeom(d, w.key).at(0, d.sheathing + d.stud.d / 2).x, (d.floorTop + d.wallTop) / 2, wallGeom(d, w.key).at(0, d.sheathing + d.stud.d / 2).z]
        : w.center,
      size: w.key === "front" || w.key === "back" ? [d.L - 0.2, d.wallTop - d.floorTop - 0.1, 0.12] : [0.12, d.wallTop - d.floorTop - 0.1, d.W - 0.2],
      material: MAT.insulation,
      stage: 18,
      explodeGroup: `assembly.wall.${w.key}`,
      explodeVector: [w.out[0] * 0.4, 0.1, w.out[2] * 0.4],
      tags: ["thermal", w.key],
      short: "Cavity insulation in the exterior wall.",
      purpose: "Thermal control. R-value is not a compliance claim.",
      provenance: PROV_SCIENCE,
    });
    addBox(reg, {
      id: `finish.drywall.${w.key}`,
      type: "drywall",
      label: `${cap(w.key)} drywall`,
      parentId: "assembly.finish",
      trade: "finish",
      center:
        w.key === "front"
          ? [0, (d.floorTop + d.wallTop) / 2, d.hW - 0.16]
          : w.key === "back"
            ? [0, (d.floorTop + d.wallTop) / 2, -d.hW + 0.16]
            : w.key === "left"
              ? [-d.hL + 0.16, (d.floorTop + d.wallTop) / 2, 0]
              : [d.hL - 0.16, (d.floorTop + d.wallTop) / 2, 0],
      size: w.key === "front" || w.key === "back" ? [d.L - 0.28, d.wallTop - d.floorTop - 0.08, 0.013] : [0.013, d.wallTop - d.floorTop - 0.08, d.W - 0.28],
      material: MAT.gypsum,
      stage: 20,
      explodeGroup: "assembly.finish",
      explodeVector: [w.out[0] * 0.35, 0, w.out[2] * 0.35],
      tags: ["finish", w.key],
      short: "Interior gypsum on this wall.",
      purpose: "Conceal the cavity after services are in.",
    });
  }
}

function pipe(
  reg: Registry,
  id: string,
  label: string,
  type: "pipe-supply" | "pipe-dwv" | "pipe-vent" | "cable" | "refrigerant-line" | "condensate" | "duct",
  a: Vec3,
  b: Vec3,
  dia: number,
  material: MaterialDescriptor,
  stage: number,
  trade: TradeId,
  tags: string[],
  short: string,
  purpose: string,
  extra?: { parentId?: string; explodeGroup?: string; explodeVector?: Vec3; slope?: boolean },
): LinearRun {
  const horiz = Math.hypot(b[0] - a[0], b[2] - a[2]);
  const run = extra?.slope && horiz >= 0.4 ? slopedDrain(a, b) : linearRun(a, b);
  const { center, size } = segmentBox(run.from, run.to, dia);
  addBox(reg, {
    id,
    type: type as ComponentType,
    label,
    parentId: extra?.parentId ?? `assembly.${trade}`,
    trade,
    center,
    size,
    material,
    stage,
    explodeGroup: extra?.explodeGroup ?? `assembly.${trade}`,
    explodeVector: extra?.explodeVector ?? [0, 0.9, 0],
    tags,
    short,
    purpose,
    provenance: PROV_EDU,
    system: { systemId: `system.${trade}`, nodeId: id, role: type },
    run,
  });
  return run;
}

export function addServices(reg: Registry, d: HouseDims, opt: WoodSlabOptions) {
  addAssembly(reg, {
    id: "assembly.plumbing",
    label: "Plumbing",
    trade: "plumbing",
    center: [opt.stack.x, 1, opt.stack.z],
    size: [4, 3, 4],
    stage: 15,
    explodeVector: [0, 1.1, 0],
    short: "Supply, DWV and vent. Under-slab drains, then walls and attic.",
    purpose: "A slab house has no joist space. Drains go in the granular base before the pour.",
    tags: ["plumbing"],
  });
  addAssembly(reg, {
    id: "assembly.electrical",
    label: "Electrical",
    trade: "electrical",
    center: [opt.panel.x, 1.4, opt.panel.z],
    size: [2, 2.4, 2],
    stage: 17,
    explodeVector: [0, 0.8, 0],
    short: "Service, panel and branch cables in walls and attic.",
    purpose: "Show routing, not CEC sizing.",
    tags: ["electrical"],
  });
  addAssembly(reg, {
    id: "assembly.hvac",
    label: "HVAC",
    trade: "hvac",
    center: [opt.indoorHead.x, 1.8, opt.indoorHead.z],
    size: [2, 2, 2],
    stage: 16,
    explodeVector: [0, 0.7, 0],
    short: "Ductless heat pump plus bath exhaust.",
    purpose: "A compact slab cottage does not need a basement trunk.",
    tags: ["hvac"],
  });
  addAssembly(reg, {
    id: "assembly.finish",
    label: "Interior finish",
    trade: "finish",
    center: [0, 1.3, 0],
    size: [d.L, 2.4, d.W],
    stage: 20,
    explodeVector: [0, 0, 0],
    short: "Drywall and floor finish.",
    purpose: "Conceal the rough building.",
    tags: ["finish"],
  });

  const underY = -0.16;
  const atticY = d.wallTop + 0.1;
  const atticZ = d.hW * 0.45;
  const kitWallZ = d.hW - (d.sheathing + d.stud.d / 2);
  const studStart = -d.hL + d.stud.t / 2;
  const rawVent = opt.kitchen.x + (opt.kitchen.x >= 0 ? 0.7 : -0.7);
  const bay = Math.round((rawVent - studStart) / d.studOc);
  const kitVentX = studStart + bay * d.studOc + d.studOc / 2;
  const lineBay = Math.round((opt.indoorHead.x - studStart) / d.studOc);
  const lineX = studStart + lineBay * d.studOc + d.studOc / 2;
  const DWV = 0.075;
  const BR = 0.04;
  const VENT = 0.04;
  const PEX = 0.02;

  addBox(reg, {
    id: "plumbing.fixture.sink.kitchen",
    type: "fixture",
    label: "Kitchen sink",
    parentId: "assembly.plumbing",
    trade: "plumbing",
    center: [opt.kitchen.x, d.floorTop + 0.9, opt.kitchen.z],
    size: [0.76, 0.2, 0.5],
    material: MAT.porcelain,
    stage: 21,
    explodeGroup: "assembly.plumbing",
    explodeVector: [0, 0.4, 0.3],
    tags: ["fixture", "kitchen"],
    short: "Kitchen sink.",
    purpose: "A fixture, not a wall-cavity object.",
  });
  addBox(reg, {
    id: "plumbing.dwv.trap.kitchen.001",
    type: "trap",
    label: "Kitchen trap",
    parentId: "assembly.plumbing",
    trade: "plumbing",
    center: [opt.kitchen.x, d.floorTop + 0.55, opt.kitchen.z],
    size: [0.12, 0.16, 0.12],
    material: MAT.abs,
    stage: 15,
    explodeGroup: "assembly.plumbing",
    explodeVector: [0, 0.3, 0.2],
    tags: ["fixture-trap", "kitchen"],
    short: "P-trap under the kitchen sink.",
    purpose: "Hold the trap seal. Cabinet/occupied zone, not the wall.",
  });
  pipe(reg, "plumbing.dwv.branch.kitchen.drop", "Kitchen drain drop", "pipe-dwv",
    [opt.kitchen.x, d.floorTop + 0.45, opt.kitchen.z], [opt.kitchen.x, underY, opt.kitchen.z], BR, MAT.abs, 4, "plumbing",
    ["plumbing", "dwv", "kitchen"], "Kitchen drain through the slab.", "The only kitchen DWV above the slab is the fixture drop.",
    { explodeVector: [0, -0.4, 0] });
  addBox(reg, {
    id: "penetration.slab.kitchen.dwv",
    type: "penetration",
    label: "Kitchen DWV slab penetration",
    parentId: "assembly.foundation",
    trade: "plumbing",
    center: [opt.kitchen.x, d.floorTop - 0.02, opt.kitchen.z],
    size: [0.08, 0.14, 0.08],
    material: MAT.concrete,
    stage: 4,
    explodeGroup: "assembly.foundation",
    explodeVector: [0, -0.3, 0],
    tags: ["penetration", "slab"],
    short: "Sleeve where the kitchen drain passes the slab.",
    purpose: "A modelled host/trade pair.",
    penetration: { hostId: "slab.grade", tradeComponentId: "plumbing.dwv.branch.kitchen.drop", purpose: "dwv-slab" },
  });
  pipe(reg, "plumbing.dwv.branch.kitchen.001", "Kitchen under-slab drain", "pipe-dwv",
    [opt.kitchen.x, underY, opt.kitchen.z], [opt.stack.x, underY, opt.kitchen.z], BR, MAT.abs, 4, "plumbing",
    ["plumbing", "dwv"], "Under-slab kitchen drain, sloped toward the stack.", "Gravity fall is a project-model 1:50, not an NPC table.",
    { slope: true, explodeVector: [0, -0.5, 0] });
  pipe(reg, "plumbing.dwv.branch.kitchen.002", "Kitchen drain to stack", "pipe-dwv",
    [opt.stack.x, underY, opt.kitchen.z], [opt.stack.x, underY, opt.stack.z], BR, MAT.abs, 4, "plumbing",
    ["plumbing", "dwv"], "Turn under the slab to the stack.", "Stay in the granular base.",
    { slope: true, explodeVector: [0, -0.5, 0] });

  addBox(reg, {
    id: "plumbing.fixture.sink.bath",
    type: "fixture",
    label: "Lavatory",
    parentId: "assembly.plumbing",
    trade: "plumbing",
    center: [opt.bath.x, d.floorTop + 0.82, opt.bath.z + 0.45],
    size: [0.5, 0.16, 0.4],
    material: MAT.porcelain,
    stage: 21,
    explodeGroup: "assembly.plumbing",
    explodeVector: [-0.3, 0.3, 0],
    tags: ["fixture", "bath"],
    short: "Bathroom lavatory.",
    purpose: "A fixture in the room.",
  });
  addBox(reg, {
    id: "plumbing.dwv.trap.lav.001",
    type: "trap",
    label: "Lavatory trap",
    parentId: "assembly.plumbing",
    trade: "plumbing",
    center: [opt.bath.x, d.floorTop + 0.5, opt.bath.z + 0.45],
    size: [0.1, 0.14, 0.1],
    material: MAT.abs,
    stage: 15,
    explodeGroup: "assembly.plumbing",
    explodeVector: [-0.25, 0.2, 0],
    tags: ["fixture-trap", "bath"],
    short: "Lavatory P-trap.",
    purpose: "Cabinet/occupied, not wall cavity.",
  });
  addBox(reg, {
    id: "plumbing.fixture.toilet.001",
    type: "fixture",
    label: "Toilet",
    parentId: "assembly.plumbing",
    trade: "plumbing",
    center: [opt.bath.x + 0.7, d.floorTop + 0.2, opt.bath.z],
    size: [0.38, 0.4, 0.65],
    material: MAT.porcelain,
    stage: 21,
    explodeGroup: "assembly.plumbing",
    explodeVector: [-0.2, 0.2, 0],
    tags: ["fixture", "bath"],
    short: "Toilet on the slab.",
    purpose: "Flange through the slab to the under-slab drain.",
  });
  pipe(reg, "plumbing.dwv.branch.lav.drop", "Lavatory drain drop", "pipe-dwv",
    [opt.bath.x, d.floorTop + 0.4, opt.bath.z + 0.45], [opt.bath.x, underY, opt.bath.z + 0.45], BR, MAT.abs, 4, "plumbing",
    ["plumbing", "dwv", "bath"], "Lavatory drain through the slab.", "Drop at the fixture.",
    { explodeVector: [0, -0.35, 0] });
  pipe(reg, "plumbing.dwv.branch.lav.001", "Lavatory under-slab drain", "pipe-dwv",
    [opt.bath.x, underY, opt.bath.z + 0.45], [opt.stack.x, underY, opt.stack.z], BR, MAT.abs, 4, "plumbing",
    ["plumbing", "dwv"], "Under-slab lavatory drain to the stack.", "Sloped in the granular base.",
    { slope: true, explodeVector: [0, -0.5, 0] });
  pipe(reg, "plumbing.dwv.branch.toilet.drop", "Toilet drain through slab", "pipe-dwv",
    [opt.bath.x + 0.7, d.floorTop + 0.05, opt.bath.z], [opt.bath.x + 0.7, underY, opt.bath.z], DWV, MAT.abs, 4, "plumbing",
    ["plumbing", "dwv", "bath"], "Toilet flange drop through the slab.", "A modelled slab penetration.",
    { explodeVector: [0, -0.35, 0] });
  addBox(reg, {
    id: "penetration.slab.toilet.dwv",
    type: "penetration",
    label: "Toilet slab penetration",
    parentId: "assembly.foundation",
    trade: "plumbing",
    center: [opt.bath.x + 0.7, d.floorTop - 0.02, opt.bath.z],
    size: [0.12, 0.14, 0.12],
    material: MAT.concrete,
    stage: 4,
    explodeGroup: "assembly.foundation",
    explodeVector: [0, -0.3, 0],
    tags: ["penetration", "slab"],
    short: "Opening for the toilet flange.",
    purpose: "Host/trade pair at the slab.",
    penetration: { hostId: "slab.grade", tradeComponentId: "plumbing.dwv.branch.toilet.drop", purpose: "toilet-flange" },
  });
  pipe(reg, "plumbing.dwv.branch.toilet.001", "Toilet under-slab drain", "pipe-dwv",
    [opt.bath.x + 0.7, underY, opt.bath.z], [opt.stack.x, underY, opt.stack.z], DWV, MAT.abs, 4, "plumbing",
    ["plumbing", "dwv"], "Under-slab toilet drain to the stack.", "Larger pipe, still in the base.",
    { slope: true, explodeVector: [0, -0.5, 0] });

  pipe(reg, "plumbing.dwv.stack.001", "Soil stack", "pipe-dwv",
    [opt.stack.x, underY, opt.stack.z], [opt.stack.x, atticY, opt.stack.z], DWV, MAT.abs, 15, "plumbing",
    ["plumbing", "dwv", "stack"], "The main stack in the wet wall.", "Collects under-slab branches and continues as the vent.",
    { explodeGroup: "assembly.wall.left", explodeVector: [-1.4, 0.4, 0] });
  addBox(reg, {
    id: "penetration.slab.stack",
    type: "penetration",
    label: "Stack slab penetration",
    parentId: "assembly.foundation",
    trade: "plumbing",
    center: [opt.stack.x, d.floorTop - 0.02, opt.stack.z],
    size: [0.12, 0.14, 0.12],
    material: MAT.concrete,
    stage: 4,
    explodeGroup: "assembly.foundation",
    explodeVector: [0, -0.3, 0],
    tags: ["penetration", "slab"],
    short: "Where the stack passes the slab.",
    purpose: "Host/trade pair.",
    penetration: { hostId: "slab.grade", tradeComponentId: "plumbing.dwv.stack.001", purpose: "stack-slab" },
  });
  pipe(reg, "plumbing.dwv.building-drain.001", "Building drain", "pipe-dwv",
    [opt.stack.x, underY, opt.stack.z], [-d.hL - 0.6, underY - 0.08, opt.stack.z], DWV, MAT.abs, 4, "plumbing",
    ["plumbing", "dwv", "service"], "Building drain leaving under the slab.", "Exit at the left thickened edge.",
    { slope: true, explodeVector: [0, -0.55, 0] });
  addBox(reg, {
    id: "penetration.slab.edge.drain",
    type: "penetration",
    label: "Building-drain edge penetration",
    parentId: "assembly.foundation",
    trade: "plumbing",
    center: [-d.hL - 0.05, -0.05, opt.stack.z],
    size: [0.2, 0.16, 0.16],
    material: MAT.concrete,
    stage: 4,
    explodeGroup: "assembly.foundation",
    explodeVector: [-0.3, -0.2, 0],
    tags: ["penetration", "slab"],
    short: "Where the building drain leaves the thickened edge.",
    purpose: "A modelled penetration. Sizing is not NPC.",
    penetration: { hostId: "slab.edge.left", tradeComponentId: "plumbing.dwv.building-drain.001", purpose: "building-drain" },
  });

  const roofY = d.ridgeY + 0.12;
  pipe(reg, "plumbing.vent.stack.001", "Stack vent through roof", "pipe-vent",
    [opt.stack.x, atticY, opt.stack.z], [opt.stack.x, roofY, opt.stack.z], VENT, MAT.pvc, 15, "plumbing",
    ["plumbing", "vent"], "Stack vent terminating above the roof.", "Termination clearances are not encoded as NPC text.",
    { explodeGroup: "assembly.roof", explodeVector: [0, 2.2, 0] });
  addBox(reg, {
    id: "penetration.roof.plumbing.001",
    type: "penetration",
    label: "Stack vent roof penetration",
    parentId: "assembly.roof",
    trade: "plumbing",
    center: [opt.stack.x, d.ridgeY - 0.12, opt.stack.z],
    size: [0.1, 0.2, 0.1],
    material: MAT.osb,
    stage: 15,
    explodeGroup: "assembly.roof",
    explodeVector: [0, 2.4, 0],
    tags: ["plumbing", "penetration", "roof"],
    short: "Opening where the stack vent passes the roof deck.",
    purpose: "Host/trade penetration. Flashing is simplified.",
    penetration: { hostId: "roof.sheathing.n", tradeComponentId: "plumbing.vent.stack.001", purpose: "stack-vent" },
  });
  pipe(reg, "plumbing.vent.kitchen.rise", "Kitchen vent riser", "pipe-vent",
    [kitVentX, d.floorTop + 0.7, kitWallZ], [kitVentX, d.wallTop + 0.02, kitWallZ], VENT, MAT.pvc, 15, "plumbing",
    ["plumbing", "vent", "kitchen"], "Kitchen vent rising in the front wall.", "Through the top plate, then inboard.",
    { explodeGroup: "assembly.wall.front", explodeVector: [0, 0.4, 1.5] });
  pipe(reg, "plumbing.vent.kitchen.001", "Kitchen vent through attic", "pipe-vent",
    [kitVentX, atticY, atticZ], [opt.stack.x, atticY, atticZ], VENT, MAT.pvc, 15, "plumbing",
    ["plumbing", "vent", "kitchen"], "Kitchen vent crossing the attic below the rafters.", "Not along the eave, not through the roof.",
    { explodeGroup: "assembly.roof", explodeVector: [0, 1.5, 0] });
  pipe(reg, "plumbing.vent.kitchen.into-attic", "Kitchen vent into attic", "pipe-vent",
    [kitVentX, d.wallTop + 0.02, kitWallZ], [kitVentX, atticY, atticZ], VENT, MAT.pvc, 15, "plumbing",
    ["plumbing", "vent", "kitchen"], "Turn inboard off the eave.", "Stay below the roof deck.",
    { explodeGroup: "assembly.roof", explodeVector: [0, 1.4, 0] });
  pipe(reg, "plumbing.vent.kitchen.002", "Kitchen vent to stack", "pipe-vent",
    [opt.stack.x, atticY, atticZ], [opt.stack.x, atticY, opt.stack.z], VENT, MAT.pvc, 15, "plumbing",
    ["plumbing", "vent"], "Join the stack in the attic.", "Below the roof deck.",
    { explodeGroup: "assembly.roof", explodeVector: [0, 1.5, 0] });

  addBox(reg, {
    id: "plumbing.waterheater.001",
    type: "water-heater",
    label: "Water heater",
    parentId: "assembly.plumbing",
    trade: "plumbing",
    center: [opt.heater.x, d.floorTop + 0.6, opt.heater.z],
    size: [0.5, 1.2, 0.5],
    material: MAT.steel,
    stage: 15,
    explodeGroup: "assembly.plumbing",
    explodeVector: [0.4, 0.3, 0],
    tags: ["plumbing", "equipment"],
    short: "Electric water heater on the slab.",
    purpose: "A mechanical-closet appliance. Fuel and sizing are not claimed.",
  });
  addBox(reg, {
    id: "plumbing.service-entry",
    type: "service-entry",
    label: "Water service entry",
    parentId: "assembly.plumbing",
    trade: "plumbing",
    center: [-d.hL - 0.15, -0.2, opt.heater.z],
    size: [0.3, 0.12, 0.12],
    material: MAT.pex,
    stage: 4,
    explodeGroup: "assembly.plumbing",
    explodeVector: [-0.4, -0.2, 0],
    tags: ["plumbing", "service-entry"],
    short: "Water service arriving under the slab edge.",
    purpose: "Where the public/private water meets this house. Utility details unknown.",
  });
  pipe(reg, "plumbing.supply.cold.main", "Cold main under slab", "pipe-supply",
    [-d.hL - 0.15, -0.2, opt.heater.z], [opt.heater.x, -0.2, opt.heater.z], PEX, MAT.pex, 4, "plumbing",
    ["plumbing", "supply", "cold"], "Cold water under the slab to the heater closet.", "Slab houses often bring water in below the pour.",
    { explodeVector: [0, -0.4, 0] });
  pipe(reg, "plumbing.supply.cold.rise", "Cold rise to heater", "pipe-supply",
    [opt.heater.x, -0.2, opt.heater.z], [opt.heater.x, d.floorTop + 0.4, opt.heater.z], PEX, MAT.pex, 15, "plumbing",
    ["plumbing", "supply"], "Cold rise at the water heater.", "Through the slab at the closet.",
    { explodeVector: [0.3, 0.2, 0] });
  addBox(reg, {
    id: "penetration.slab.supply",
    type: "penetration",
    label: "Supply slab penetration",
    parentId: "assembly.foundation",
    trade: "plumbing",
    center: [opt.heater.x, d.floorTop - 0.02, opt.heater.z],
    size: [0.06, 0.12, 0.06],
    material: MAT.concrete,
    stage: 4,
    explodeGroup: "assembly.foundation",
    explodeVector: [0, -0.25, 0],
    tags: ["penetration", "slab"],
    short: "Cold rise through the slab.",
    purpose: "Host/trade pair.",
    penetration: { hostId: "slab.grade", tradeComponentId: "plumbing.supply.cold.rise", purpose: "supply-slab" },
  });
  pipe(reg, "plumbing.supply.cold.kitchen.001", "Cold to kitchen in attic", "pipe-supply",
    [opt.heater.x, atticY, opt.heater.z], [opt.kitchen.x, atticY, atticZ], PEX, MAT.pex, 15, "plumbing",
    ["plumbing", "supply", "cold", "kitchen"], "Cold distribution in the attic, not across the room.", "A slab house has no joist bay for this run.",
    { explodeGroup: "assembly.roof", explodeVector: [0, 1.3, 0] });
  pipe(reg, "plumbing.supply.cold.kitchen.drop", "Cold kitchen drop", "pipe-supply",
    [kitVentX, atticY, kitWallZ], [kitVentX, d.floorTop + 0.9, kitWallZ], PEX, MAT.pex, 15, "plumbing",
    ["plumbing", "supply", "kitchen"], "Drop in the front wall to the kitchen sink.", "Wall cavity, then fixture.",
    { explodeGroup: "assembly.wall.front", explodeVector: [0, 0.3, 1.3] });
  pipe(reg, "plumbing.supply.hot.kitchen.001", "Hot to kitchen in attic", "pipe-supply",
    [opt.heater.x, atticY + 0.05, opt.heater.z], [opt.kitchen.x, atticY + 0.05, atticZ], PEX, MAT.pex, 15, "plumbing",
    ["plumbing", "supply", "hot", "kitchen"], "Hot distribution in the attic.", "Paired with cold, offset.",
    { explodeGroup: "assembly.roof", explodeVector: [0, 1.35, 0] });

  addBox(reg, {
    id: "electrical.service-entry",
    type: "service-entry",
    label: "Electrical service entry",
    parentId: "assembly.electrical",
    trade: "electrical",
    center: [opt.panel.x, d.wallTop - 0.3, -d.hW - 0.12],
    size: [0.12, 0.18, 0.12],
    material: MAT.panel,
    stage: 17,
    explodeGroup: "assembly.electrical",
    explodeVector: [0, 0.4, -0.6],
    tags: ["electrical", "service-entry"],
    short: "Service arriving at the back wall.",
    purpose: "Mast/lateral details are not modelled.",
  });
  addBox(reg, {
    id: "electrical.panel.main",
    type: "panel",
    label: "Loadcentre",
    parentId: "assembly.electrical",
    trade: "electrical",
    center: [opt.panel.x, d.floorTop + 1.35, opt.panel.z],
    size: [0.1, 0.7, 0.36],
    material: MAT.panel,
    stage: 17,
    explodeGroup: "assembly.electrical",
    explodeVector: [0.4, 0.2, 0],
    tags: ["electrical"],
    short: "The cottage panel.",
    purpose: "A loadcentre. Breaker schedule is not CEC.",
  });
  pipe(reg, "electrical.cable.service", "Service cable to panel", "cable",
    [opt.panel.x, d.wallTop - 0.3, -d.hW - 0.05], [opt.panel.x, d.floorTop + 1.6, opt.panel.z], 0.016, MAT.cable, 17, "electrical",
    ["electrical"], "Service conductors down to the panel in the wall.", "Routing concept only.",
    { explodeGroup: "assembly.wall.back", explodeVector: [0, 0.3, -1.2] });
  pipe(reg, "electrical.cable.kitchen.001", "Kitchen circuit in attic", "cable",
    [opt.panel.x, atticY - 0.05, opt.panel.z], [opt.kitchen.x, atticY - 0.05, atticZ], 0.014, MAT.cable, 17, "electrical",
    ["electrical", "kitchen"], "Kitchen branch in the attic, L-routed.", "Not a diagonal through occupied space.",
    { explodeGroup: "assembly.roof", explodeVector: [0, 1.2, 0] });
  addBox(reg, {
    id: "electrical.receptacle.kitchen",
    type: "receptacle",
    label: "Kitchen receptacle",
    parentId: "assembly.electrical",
    trade: "electrical",
    center: [opt.kitchen.x + 0.4, d.floorTop + 1.05, kitWallZ],
    size: [0.07, 0.11, 0.04],
    material: MAT.device,
    stage: 21,
    explodeGroup: "assembly.wall.front",
    explodeVector: [0, 0.2, 1.3],
    tags: ["electrical", "kitchen"],
    short: "A kitchen receptacle.",
    purpose: "Device in the wall. GFCI/AFCI is not proven.",
  });
  addBox(reg, {
    id: "electrical.luminaire.living",
    type: "luminaire",
    label: "Ceiling luminaire",
    parentId: "assembly.electrical",
    trade: "electrical",
    center: [0.4, d.wallTop - 0.04, 0.3],
    size: [0.28, 0.06, 0.28],
    material: MAT.device,
    stage: 21,
    explodeGroup: "assembly.electrical",
    explodeVector: [0, 0.5, 0],
    tags: ["electrical"],
    short: "A ceiling light.",
    purpose: "Show a lighting outlet on the ceiling joists.",
  });
  pipe(reg, "electrical.cable.light.001", "Lighting circuit", "cable",
    [opt.panel.x, atticY - 0.08, opt.panel.z], [0.4, atticY - 0.08, 0.3], 0.012, MAT.cable, 17, "electrical",
    ["electrical"], "Lighting cable in the attic.", "Stay above the ceiling.",
    { explodeGroup: "assembly.roof", explodeVector: [0, 1.15, 0] });
  addBox(reg, {
    id: "electrical.receptacle.bath",
    type: "receptacle",
    label: "Bath receptacle",
    parentId: "assembly.electrical",
    trade: "electrical",
    center: [opt.bath.x, d.floorTop + 1.1, opt.bath.z + 0.02],
    size: [0.07, 0.11, 0.04],
    material: MAT.device,
    stage: 21,
    explodeGroup: "assembly.wall.left",
    explodeVector: [-1.3, 0.2, 0],
    tags: ["electrical", "bath", "gfci-unverified"],
    short: "A bathroom receptacle.",
    purpose: "GFCI protection is not proven in this graph.",
  });

  addBox(reg, {
    id: "hvac.heatpump.indoor.001",
    type: "heat-pump-indoor",
    label: "Indoor head",
    parentId: "assembly.hvac",
    trade: "hvac",
    center: [opt.indoorHead.x, d.wallTop - 0.35, opt.indoorHead.z],
    size: [0.85, 0.28, 0.22],
    material: MAT.steel,
    stage: 16,
    explodeGroup: "assembly.hvac",
    explodeVector: [0, 0.3, -0.4],
    tags: ["hvac"],
    short: "Ductless indoor head high on the back wall.",
    purpose: "Heat and cool this cottage. Capacity is not a design.",
  });
  addBox(reg, {
    id: "hvac.heatpump.outdoor.001",
    type: "heat-pump-outdoor",
    label: "Outdoor unit",
    parentId: "assembly.hvac",
    trade: "hvac",
    center: [opt.outdoorUnit.x, 0.42, opt.outdoorUnit.z],
    size: [0.85, 0.7, 0.34],
    material: MAT.steel,
    stage: 16,
    explodeGroup: "assembly.hvac",
    explodeVector: [0.6, 0.2, 0],
    tags: ["hvac", "exterior-equipment"],
    short: "The outdoor heat-pump unit on a pad.",
    purpose: "Reject heat. Clearances are not a CEC/NBC determination.",
  });
  addBox(reg, {
    id: "hvac.pad.outdoor",
    type: "equipment-pad",
    label: "Heat-pump pad",
    parentId: "assembly.hvac",
    trade: "hvac",
    center: [opt.outdoorUnit.x, 0.05, opt.outdoorUnit.z],
    size: [1.0, 0.08, 0.5],
    material: MAT.concrete,
    stage: 16,
    explodeGroup: "assembly.hvac",
    explodeVector: [0.5, -0.1, 0],
    tags: ["hvac"],
    short: "A pad under the outdoor unit.",
    purpose: "The unit is supported, not floating.",
  });
  pipe(reg, "hvac.refrigerant.001", "Refrigerant line", "refrigerant-line",
    [lineX, d.wallTop - 0.4, opt.indoorHead.z], [lineX, d.wallTop - 0.4, -d.hW - 0.25], 0.02, MAT.copper, 16, "hvac",
    ["hvac"], "Line set through a stud bay in the back wall, then outside.", "Does not cross the room.",
    { explodeGroup: "assembly.hvac", explodeVector: [0.2, 0.15, -0.5] });
  pipe(reg, "hvac.refrigerant.002", "Outdoor refrigerant drop", "refrigerant-line",
    [lineX, d.wallTop - 0.4, -d.hW - 0.25], [opt.outdoorUnit.x, 0.7, opt.outdoorUnit.z], 0.02, MAT.copper, 16, "hvac",
    ["hvac", "exterior-equipment"], "Drop outside to the outdoor unit on its pad.", "Stays outside the envelope.",
    { explodeGroup: "assembly.hvac", explodeVector: [0.2, 0.1, -0.4] });
  addBox(reg, {
    id: "penetration.wall.back.hvac",
    type: "penetration",
    label: "Line-set wall penetration",
    parentId: "assembly.wall.back",
    trade: "hvac",
    center: [opt.indoorHead.x, d.wallTop - 0.45, -d.hW],
    size: [0.08, 0.08, 0.18],
    material: MAT.wood,
    stage: 16,
    explodeGroup: "assembly.wall.back",
    explodeVector: [0, 0.2, -1.4],
    tags: ["penetration", "hvac"],
    short: "Where the line set passes the back wall.",
    purpose: "Host/trade pair.",
    penetration: { hostId: "assembly.wall.back.sheathing", tradeComponentId: "hvac.refrigerant.001", purpose: "lineset" },
  });
  addBox(reg, {
    id: "hvac.exhaust.bath",
    type: "exhaust",
    label: "Bath exhaust fan",
    parentId: "assembly.hvac",
    trade: "hvac",
    center: [opt.bath.x, d.wallTop - 0.06, opt.bath.z],
    size: [0.22, 0.08, 0.22],
    material: MAT.steel,
    stage: 16,
    explodeGroup: "assembly.hvac",
    explodeVector: [0, 0.5, 0],
    tags: ["hvac", "exhaust"],
    short: "A bath exhaust fan in the ceiling.",
    purpose: "Move moist air. Duct length/termination is simplified.",
  });
  pipe(reg, "hvac.exhaust.duct.001", "Bath exhaust duct", "duct",
    [opt.bath.x, atticY, opt.bath.z], [opt.bath.x, atticY, -d.hW + 0.55], 0.1, MAT.steel, 16, "hvac",
    ["hvac", "exhaust"], "Exhaust duct in the attic to the back wall, below the rafters.", "Not through the roof covering.",
    { explodeGroup: "assembly.roof", explodeVector: [0, 1.2, 0] });
  addBox(reg, {
    id: "finish.floor",
    type: "floor-finish",
    label: "Floor finish",
    parentId: "assembly.finish",
    trade: "finish",
    center: [0, d.floorTop + 0.008, 0],
    size: [d.L - 0.3, 0.014, d.W - 0.3],
    material: MAT.flooring,
    stage: 22,
    explodeGroup: "assembly.finish",
    explodeVector: [0, 0.15, 0],
    tags: ["finish"],
    short: "Interior floor finish on the slab.",
    purpose: "Conceal the slab after services are in.",
  });
}

export function kitSystems(opt: WoodSlabOptions): SystemGraph[] {
  return [
    {
      id: "system.plumbing",
      trade: "plumbing",
      nodes: [
        { id: "plumbing.service-entry", componentId: "plumbing.service-entry", kind: "service-entry", label: "Water service" },
        { id: "plumbing.waterheater.001", componentId: "plumbing.waterheater.001", kind: "water-heater", label: "Water heater" },
        { id: "plumbing.fixture.sink.kitchen", componentId: "plumbing.fixture.sink.kitchen", kind: "fixture", label: "Kitchen sink" },
        { id: "plumbing.dwv.trap.kitchen.001", componentId: "plumbing.dwv.trap.kitchen.001", kind: "trap", label: "Kitchen trap" },
        { id: "plumbing.dwv.branch.kitchen.drop", componentId: "plumbing.dwv.branch.kitchen.drop", kind: "pipe-dwv", label: "Kitchen drop" },
        { id: "plumbing.dwv.branch.kitchen.001", componentId: "plumbing.dwv.branch.kitchen.001", kind: "pipe-dwv", label: "Kitchen under-slab" },
        { id: "plumbing.dwv.branch.kitchen.002", componentId: "plumbing.dwv.branch.kitchen.002", kind: "pipe-dwv", label: "Kitchen to stack" },
        { id: "plumbing.fixture.sink.bath", componentId: "plumbing.fixture.sink.bath", kind: "fixture", label: "Lavatory" },
        { id: "plumbing.dwv.trap.lav.001", componentId: "plumbing.dwv.trap.lav.001", kind: "trap", label: "Lav trap" },
        { id: "plumbing.dwv.stack.001", componentId: "plumbing.dwv.stack.001", kind: "pipe-dwv", label: "Stack" },
        { id: "plumbing.dwv.building-drain.001", componentId: "plumbing.dwv.building-drain.001", kind: "pipe-dwv", label: "Building drain" },
        { id: "plumbing.vent.stack.001", componentId: "plumbing.vent.stack.001", kind: "pipe-vent", label: "Stack vent" },
        { id: "plumbing.vent.kitchen.001", componentId: "plumbing.vent.kitchen.001", kind: "pipe-vent", label: "Kitchen attic vent" },
        { id: "plumbing.fixture.toilet.001", componentId: "plumbing.fixture.toilet.001", kind: "fixture", label: "Toilet" },
      ],
      connections: [
        { id: "pl.in", from: "plumbing.service-entry", to: "plumbing.waterheater.001", kind: "supply" },
        { id: "pl.kit1", from: "plumbing.fixture.sink.kitchen", to: "plumbing.dwv.trap.kitchen.001", kind: "drain" },
        { id: "pl.kit2", from: "plumbing.dwv.trap.kitchen.001", to: "plumbing.dwv.branch.kitchen.drop", kind: "drain" },
        { id: "pl.kit3", from: "plumbing.dwv.branch.kitchen.drop", to: "plumbing.dwv.branch.kitchen.001", kind: "drain" },
        { id: "pl.kit4", from: "plumbing.dwv.branch.kitchen.001", to: "plumbing.dwv.branch.kitchen.002", kind: "drain" },
        { id: "pl.kit5", from: "plumbing.dwv.branch.kitchen.002", to: "plumbing.dwv.stack.001", kind: "drain" },
        { id: "pl.lav1", from: "plumbing.fixture.sink.bath", to: "plumbing.dwv.trap.lav.001", kind: "drain" },
        { id: "pl.wc", from: "plumbing.fixture.toilet.001", to: "plumbing.dwv.stack.001", kind: "drain" },
        { id: "pl.out", from: "plumbing.dwv.stack.001", to: "plumbing.dwv.building-drain.001", kind: "drain" },
        { id: "pl.vent", from: "plumbing.dwv.stack.001", to: "plumbing.vent.stack.001", kind: "vent" },
        { id: "pl.kvent", from: "plumbing.dwv.trap.kitchen.001", to: "plumbing.vent.kitchen.001", kind: "vent" },
      ],
    },
    {
      id: "system.electrical",
      trade: "electrical",
      nodes: [
        { id: "electrical.service-entry", componentId: "electrical.service-entry", kind: "service-entry", label: "Service" },
        { id: "electrical.panel.main", componentId: "electrical.panel.main", kind: "panel", label: "Panel" },
        { id: "electrical.receptacle.kitchen", componentId: "electrical.receptacle.kitchen", kind: "receptacle", label: "Kitchen rec" },
        { id: "electrical.luminaire.living", componentId: "electrical.luminaire.living", kind: "luminaire", label: "Luminaire" },
      ],
      connections: [
        { id: "el.svc", from: "electrical.service-entry", to: "electrical.panel.main", kind: "feeder" },
        { id: "el.kit", from: "electrical.panel.main", to: "electrical.receptacle.kitchen", kind: "branch" },
        { id: "el.lt", from: "electrical.panel.main", to: "electrical.luminaire.living", kind: "branch" },
      ],
    },
    {
      id: "system.hvac",
      trade: "hvac",
      nodes: [
        { id: "hvac.heatpump.indoor.001", componentId: "hvac.heatpump.indoor.001", kind: "heat-pump-indoor", label: "Indoor head" },
        { id: "hvac.heatpump.outdoor.001", componentId: "hvac.heatpump.outdoor.001", kind: "heat-pump-outdoor", label: "Outdoor unit" },
        { id: "hvac.exhaust.bath", componentId: "hvac.exhaust.bath", kind: "exhaust", label: "Bath exhaust" },
      ],
      connections: [
        { id: "hv.ref", from: "hvac.heatpump.indoor.001", to: "hvac.heatpump.outdoor.001", kind: "refrigerant" },
      ],
    },
  ];
}

export function buildWoodSlab(opt: WoodSlabOptions): KitBuild {
  const d = makeDims(opt.L, opt.W, opt.pitch, opt.overhang);
  const reg = createRegistry();
  addSiteAndSlab(reg, d);
  addFramedWalls(reg, d, opt.openings);
  addRoof(reg, d);
  addServices(reg, d, opt);
  addEnvelopeAndFinish(reg, d);
  const relations: Relation[] = [
    { id: "rel.stack-in-wall", kind: "contained-in", a: "plumbing.dwv.stack.001", b: "assembly.wall.left", authorityClass: "PROJECT_MODEL_ASSUMPTION" },
    { id: "rel.head-on-wall", kind: "attached-to", a: "hvac.heatpump.indoor.001", b: "assembly.wall.back", authorityClass: "PROJECT_MODEL_ASSUMPTION" },
    { id: "rel.outdoor-on-pad", kind: "supported-by", a: "hvac.heatpump.outdoor.001", b: "hvac.pad.outdoor", authorityClass: "PROJECT_MODEL_ASSUMPTION" },
    { id: "rel.sheathing-on-rafters", kind: "supported-by", a: "roof.sheathing.s", b: "rafter.s.00", authorityClass: "PROJECT_MODEL_ASSUMPTION" },
    { id: "rel.plate-on-slab", kind: "supported-by", a: "assembly.wall.front.plate.bottom", b: "slab.grade", authorityClass: "PROJECT_MODEL_ASSUMPTION" },
  ];
  const attachments: Attachment[] = [
    { id: "att.outdoor-pad", hostId: "hvac.pad.outdoor", attachedId: "hvac.heatpump.outdoor.001", kind: "bearing", verified: false, authorityClass: "PROJECT_MODEL_ASSUMPTION" },
    { id: "att.gasket-front", hostId: "slab.grade", attachedId: "assembly.wall.front.gasket", kind: "bearing", verified: false, authorityClass: "PROJECT_MODEL_ASSUMPTION" },
  ];
  return { reg, dims: d, systems: kitSystems(opt), relations, attachments };
}

export function freezeGraph(
  id: string,
  title: string,
  kit: KitBuild,
  extra?: { systems?: SystemGraph[]; relations?: Relation[]; attachments?: Attachment[] },
): BuildingGraph {
  const assemblies = Object.values(kit.reg.components).filter((c) => c.type === "assembly").map((c) => c.id);
  const graph: BuildingGraph = {
    id,
    version: "0.3.0-depth",
    title,
    jurisdictionId: "ca-pei",
    projectDate: "2026-09-10",
    components: kit.reg.components,
    rootIds: assemblies,
    assemblies,
    systems: [...kit.systems, ...(extra?.systems ?? [])],
    relations: [...kit.relations, ...(extra?.relations ?? [])],
    attachments: [...kit.attachments, ...(extra?.attachments ?? [])],
  };
  graph.site = siteFacts(graph);
  return Object.freeze(graph) as BuildingGraph;
}

export { MAT, createRegistry, addBox, addAssembly, pipe };
