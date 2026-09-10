import type { Vec3 } from "@/crates/building-graph/types";
import { MAT, PROV_EDU, PROV_MODEL } from "./materials";
import { P, Y, halfL, halfW } from "./params";
import type { Registry } from "./registry";

const learn = (short: string, purpose: string, failureModes: string[] = []) => ({
  shortDescription: short,
  purpose,
  failureModes,
  claimCategory: "educational-simplification" as const,
});

type WallKey = "front" | "back" | "left" | "right";

type Opening = {
  id: string;
  kind: "window" | "door";
  s: number;
  w: number;
  h: number;
  sill: number;
  challenge?: boolean;
};

function wallGeom(key: WallKey) {
  const t = P.stud.t;
  const d = P.stud.d;
  if (key === "front" || key === "back") {
    const sign = key === "front" ? 1 : -1;
    return {
      length: P.length,
      outward: [0, 0, sign] as Vec3,
      lumber: (along: number, y: number, depth: number): Vec3 => [along, y, depth],
      at: (s: number, inset: number) => ({ x: s, z: sign * (halfW - inset) }),
      whole: [0, 1.35, sign * 2.1] as Vec3,
    };
  }
  const sign = key === "right" ? 1 : -1;
  return {
    length: P.width,
    outward: [sign, 0, 0] as Vec3,
    lumber: (along: number, y: number, depth: number): Vec3 => [depth, y, along],
    at: (s: number, inset: number) => ({ x: sign * (halfL - inset), z: s }),
    whole: [sign * 2.1, 1.35, 0] as Vec3,
  };
}

function overlaps(s: number, t: number, openings: Opening[]): boolean {
  const half = t / 2 + 0.002;
  for (const o of openings) {
    const kit = o.w / 2 + t * 2 + 0.01;
    if (s + half > o.s - kit && s - half < o.s + kit) return true;
  }
  return false;
}

export function addWalls(reg: Registry) {
  const walls: { key: WallKey; openings: Opening[] }[] = [
    {
      key: "front",
      openings: [
        { id: "D1", kind: "door", s: -2.55, w: 0.86, h: 2.03, sill: 0 },
        { id: "W1", kind: "window", s: 0.2, w: 1.22, h: 1.2, sill: 0.9, challenge: true },
        { id: "W2", kind: "window", s: 2.75, w: 1.22, h: 1.2, sill: 0.9 },
      ],
    },
    {
      key: "back",
      openings: [{ id: "W3", kind: "window", s: 0.15, w: 1.47, h: 1.2, sill: 0.9 }],
    },
    {
      key: "left",
      openings: [{ id: "W4", kind: "window", s: 0.4, w: 1.02, h: 1.2, sill: 0.9 }],
    },
    {
      key: "right",
      openings: [{ id: "W5", kind: "window", s: -0.9, w: 1.02, h: 1.2, sill: 0.9 }],
    },
  ];
  for (const w of walls) frameWall(reg, w.key, w.openings);
}

function frameWall(reg: Registry, key: WallKey, openings: Opening[]) {
  const g = wallGeom(key);
  const A = `assembly.wall.${key}`;
  const t = P.stud.t;
  const d = P.stud.d;
  const plateH = P.plate;
  const studH = P.wallStudH;
  const sheathInset = P.sheathing / 2;
  const studInset = P.sheathing + d / 2;
  const plateInset = studInset;

  reg.add({
    id: A,
    type: "assembly",
    label: `${cap(key)} exterior wall`,
    parentId: undefined,
    geometry: { kind: "group", center: [0, (Y.floorTop + Y.wallTop) / 2, 0], size: [g.length, Y.wallTop - Y.floorTop, 0.3] },
    material: MAT.wood,
    assembly: { stage: 8, dependencies: ["subfloor.0"], explodeGroup: A, explodeVector: g.whole, localExplodeVector: [0, 0, 0] },
    learning: learn(`Wood-framed ${key} wall with plates, studs and openings.`, "Carry roof and floor loads, define openings, and receive sheathing."),
    provenance: PROV_MODEL,
    tags: ["wall", key],
  });

  const bottomY = Y.floorTop + plateH / 2;
  const innerTopY = Y.studTop + plateH / 2;
  const outerTopY = Y.studTop + plateH + plateH / 2;
  const p0 = g.at(0, plateInset);

  for (const plate of [
    { id: `${A}.plate.bottom`, type: "bottom-plate" as const, y: bottomY, label: `${cap(key)} bottom plate`, stage: 8 },
    { id: `${A}.plate.top.inner`, type: "top-plate" as const, y: innerTopY, label: `${cap(key)} inner top plate`, stage: 8 },
    { id: `${A}.plate.top.outer`, type: "top-plate" as const, y: outerTopY, label: `${cap(key)} outer top plate`, stage: 8 },
  ]) {
    const localY = plate.type === "bottom-plate" ? -0.22 : 0.45;
    reg.add({
      id: plate.id,
      type: plate.type,
      label: plate.label,
      parentId: A,
      geometry: {
        kind: "box",
        center: [p0.x, plate.y, p0.z],
        size: g.lumber(g.length, plateH, d),
      },
      material: MAT.wood,
      assembly: {
        stage: plate.stage,
        dependencies: ["subfloor.0"],
        explodeGroup: A,
        explodeVector: g.whole,
        localExplodeVector: [g.outward[0] * 0.15, localY, g.outward[2] * 0.15],
      },
      structural: { loadPathRole: plate.type, required: true },
      learning: learn(
        plate.type === "bottom-plate"
          ? "Sits on the subfloor and receives every stud."
          : "A doubled top plate laps at corners and carries rafters or ceiling joists.",
        "Tie the wall into a single assembly.",
      ),
      provenance: PROV_MODEL,
      tags: ["wall", key],
    });
  }

  const studY = (Y.bottomPlateTop + Y.studTop) / 2;
  const start = -g.length / 2 + t / 2;
  const end = g.length / 2 - t / 2;
  let si = 0;
  for (let s = start; s <= end + 1e-9; s += P.studOc) {
    if (overlaps(s, t, openings)) continue;
    addStud(reg, key, g, A, `stud.${String(si).padStart(2, "0")}`, s, studY, studH, "common-stud", `${cap(key)} stud`, 8);
    si += 1;
  }
  if (!overlaps(end, t, openings)) {
    addStud(reg, key, g, A, "stud.end", end, studY, studH, "common-stud", `${cap(key)} end stud`, 8);
  }

  for (const o of openings) {
    addOpening(reg, key, g, A, o, t, d, studInset);
  }

  addSheathing(reg, key, g, A, openings, sheathInset);
}

function addStud(
  reg: Registry,
  key: WallKey,
  g: ReturnType<typeof wallGeom>,
  A: string,
  suffix: string,
  s: number,
  y: number,
  h: number,
  type: "common-stud" | "king-stud" | "jack-stud" | "cripple-stud" | "gable-stud",
  label: string,
  stage: number,
  extra?: { supportedBy?: string[]; supports?: string[]; required?: boolean; tags?: string[] },
) {
  const t = P.stud.t;
  const d = P.stud.d;
  const inset = P.sheathing + d / 2;
  const p = g.at(s, inset);
  const spread = (s / (g.length / 2 || 1)) * 0.28;
  const along: Vec3 =
    g.outward[2] !== 0 ? [spread, 0.12, g.outward[2] * 0.45] : [g.outward[0] * 0.45, 0.12, spread];
  const id = `${A}.${suffix}`;
  reg.add({
    id,
    type,
    label,
    parentId: A,
    geometry: { kind: "box", center: [p.x, y, p.z], size: g.lumber(t, h, d) },
    material: MAT.wood,
    assembly: {
      stage,
      dependencies: [`${A}.plate.bottom`],
      explodeGroup: A,
      explodeVector: g.whole,
      localExplodeVector: along,
    },
    structural: {
      loadPathRole: type,
      required: extra?.required ?? type !== "common-stud",
      supportedBy: extra?.supportedBy ?? [`${A}.plate.bottom`],
      supports: extra?.supports,
    },
    learning: learn(...studCopy(type)),
    provenance: { ...PROV_EDU, ruleIds: ["DEMO-LOADPATH-001"] },
    tags: ["wall", key, type, ...(extra?.tags ?? [])],
  });
  return id;
}

function studCopy(type: string): [string, string, string[]] {
  switch (type) {
    case "king-stud":
      return [
        "Full-height stud beside an opening. It is not the stud that carries the header.",
        "Stiffen the opening and nail the jack and header assembly.",
        ["If removed, the jack loses its backing."],
      ];
    case "jack-stud":
      return [
        "The trimmer. It bears the header and therefore the load over the opening.",
        "Carry header loads down to the bottom plate.",
        ["Remove it and the header has nothing to sit on."],
      ];
    case "cripple-stud":
      return [
        "A short stud above a header or below a window sill.",
        "Continue the stud layout so the plates stay supported.",
        ["Gaps above a header leave the top plate unbacked."],
      ];
    default:
      return [
        "A repeating wall stud. Demonstration spacing is 16″ o.c.",
        "Carry vertical load and give nailing for sheathing.",
        ["Removing several in a row breaks the wall’s load path in this model."],
      ];
  }
}

function addOpening(
  reg: Registry,
  key: WallKey,
  g: ReturnType<typeof wallGeom>,
  A: string,
  o: Opening,
  t: number,
  d: number,
  studInset: number,
) {
  const left = o.s - o.w / 2;
  const right = o.s + o.w / 2;
  const jackL = left - t / 2;
  const kingL = left - t - t / 2;
  const jackR = right + t / 2;
  const kingR = right + t + t / 2;
  const headerBottom = Y.floorTop + o.sill + o.h;
  const headerH = P.header.d;
  const headerTop = headerBottom + headerH;
  const jackH = headerBottom - Y.bottomPlateTop;
  const jackY = Y.bottomPlateTop + jackH / 2;
  const kingH = P.wallStudH;
  const kingY = (Y.bottomPlateTop + Y.studTop) / 2;
  const tags = o.challenge ? ["challenge-window"] : [];

  const kingLId = addStud(reg, key, g, A, `king.${o.id}.L`, kingL, kingY, kingH, "king-stud", `${o.id} king stud L`, 9, {
    required: true,
    tags,
  });
  const kingRId = addStud(reg, key, g, A, `king.${o.id}.R`, kingR, kingY, kingH, "king-stud", `${o.id} king stud R`, 9, {
    required: true,
    tags,
  });
  const jackLId = addStud(reg, key, g, A, `jack.${o.id}.L`, jackL, jackY, jackH, "jack-stud", `${o.id} jack stud L`, 9, {
    required: true,
    supportedBy: [`${A}.plate.bottom`],
    tags,
  });
  const jackRId = addStud(reg, key, g, A, `jack.${o.id}.R`, jackR, jackY, jackH, "jack-stud", `${o.id} jack stud R`, 9, {
    required: true,
    supportedBy: [`${A}.plate.bottom`],
    tags,
  });

  const headerLen = o.w + t * 2;
  const headerY = headerBottom + headerH / 2;
  const hp = g.at(o.s, studInset);
  const headerId = `${A}.header.${o.id}`;
  const plyT = t * 2;
  reg.add({
    id: headerId,
    type: "header",
    label: `${o.id} header (2-ply 2×10, demonstration)`,
    parentId: A,
    geometry: { kind: "box", center: [hp.x, headerY, hp.z], size: g.lumber(headerLen, headerH, plyT) },
    material: MAT.wood,
    assembly: {
      stage: 9,
      dependencies: [jackLId, jackRId],
      explodeGroup: A,
      explodeVector: g.whole,
      localExplodeVector: [g.outward[0] * 0.2, 0.55, g.outward[2] * 0.2],
    },
    structural: {
      loadPathRole: "header",
      supportedBy: [jackLId, jackRId],
      required: true,
    },
    learning: learn(
      "The beam over the opening. In this lab it sits on the jack studs.",
      "Carry loads that would have gone through the missing studs. Size is a demonstration, not a span-table result.",
      ["Unsupported if either jack is removed."],
    ),
    provenance: { ...PROV_EDU, ruleIds: ["DEMO-OPENING-001"] },
    tags: ["wall", key, "header", ...tags],
  });

  if (o.kind === "window") {
    const sillY = Y.floorTop + o.sill - t / 2;
    const sillId = `${A}.sill.${o.id}`;
    reg.add({
      id: sillId,
      type: "rough-sill",
      label: `${o.id} rough sill`,
      parentId: A,
      geometry: { kind: "box", center: [hp.x, sillY, hp.z], size: g.lumber(o.w, t, d) },
      material: MAT.wood,
      assembly: {
        stage: 9,
        dependencies: [jackLId, jackRId],
        explodeGroup: A,
        explodeVector: g.whole,
        localExplodeVector: [0, -0.2, 0],
      },
      structural: { loadPathRole: "rough-sill", supportedBy: [jackLId, jackRId] },
      learning: learn("The member at the bottom of the window rough opening.", "Support the window and receive cripple studs below."),
      provenance: PROV_MODEL,
      tags: ["wall", key, ...tags],
    });
    const cripH = sillY - t / 2 - Y.bottomPlateTop;
    if (cripH > 0.08) {
      const cripY = Y.bottomPlateTop + cripH / 2;
      let ci = 0;
      for (let s = left + t; s < right - t; s += P.studOc) {
        addStud(reg, key, g, A, `cripple.below.${o.id}.${ci}`, s, cripY, cripH, "cripple-stud", `${o.id} sill cripple`, 9, {
          tags,
        });
        ci += 1;
      }
    }
  }

  const aboveH = Y.studTop - headerTop;
  if (aboveH > 0.06) {
    const aboveY = headerTop + aboveH / 2;
    let ci = 0;
    for (let s = left + t; s < right - t; s += P.studOc) {
      addStud(reg, key, g, A, `cripple.above.${o.id}.${ci}`, s, aboveY, aboveH, "cripple-stud", `${o.id} head cripple`, 9, {
        supportedBy: [headerId],
        tags,
      });
      ci += 1;
    }
  }

  if (o.challenge) {
    const braceLen = Math.hypot(o.w, o.h * 0.85);
    const braceY = Y.floorTop + o.sill + o.h * 0.45;
    const rot: Vec3 = g.outward[2] !== 0 ? [0, 0, -Math.atan2(o.h * 0.85, o.w)] : [0, 0, 0];
    const rx = g.outward[0] !== 0 ? -Math.atan2(o.h * 0.85, o.w) * g.outward[0] : 0;
    const rotation: Vec3 = g.outward[2] !== 0 ? rot : [0, rx, 0];
    const bp = g.at(o.s, studInset - 0.02);
    reg.add({
      id: `${A}.temp-brace.${o.id}`,
      type: "temporary-brace",
      label: `${o.id} temporary opening brace`,
      parentId: A,
      geometry: {
        kind: "box",
        center: [bp.x, braceY, bp.z],
        size: g.lumber(braceLen, t, t),
        rotation,
      },
      material: MAT.brace,
      assembly: {
        stage: 9,
        dependencies: [kingLId, kingRId],
        explodeGroup: A,
        explodeVector: g.whole,
        localExplodeVector: [g.outward[0] * 0.7, 0, g.outward[2] * 0.7],
      },
      structural: { loadPathRole: "temporary", required: false },
      learning: learn(
        "A temporary brace across the rough opening. It is not a permanent structural member.",
        "Hold the opening square until the window is set. Safe to remove in this lesson.",
      ),
      provenance: PROV_EDU,
      tags: ["wall", key, "temporary", "challenge-window"],
    });
  }

  void kingLId;
  void kingRId;
}

function addSheathing(
  reg: Registry,
  key: WallKey,
  g: ReturnType<typeof wallGeom>,
  A: string,
  openings: Opening[],
  sheathInset: number,
) {
  const h = Y.wallTop - Y.floorTop;
  const y = (Y.floorTop + Y.wallTop) / 2;
  const edges = [-g.length / 2, ...openings.flatMap((o) => [o.s - o.w / 2, o.s + o.w / 2]), g.length / 2].sort(
    (a, b) => a - b,
  );
  let n = 0;
  for (let i = 0; i < edges.length - 1; i++) {
    const a = edges[i]!;
    const b = edges[i + 1]!;
    const w = b - a;
    if (w < 0.05) continue;
    const mid = (a + b) / 2;
    const opening = openings.find((o) => mid > o.s - o.w / 2 + 0.01 && mid < o.s + o.w / 2 - 0.01);
    const p = g.at(mid, sheathInset);
    if (!opening) {
      addPanel(reg, key, g, A, n++, p, y, w, h);
      continue;
    }
    if (opening.sill > 0.15) {
      const hh = opening.sill;
      const cy = Y.floorTop + hh / 2;
      addPanel(reg, key, g, A, n++, p, cy, w, hh);
    }
    const topH = Y.wallTop - (Y.floorTop + opening.sill + opening.h);
    if (topH > 0.12) {
      const cy = Y.wallTop - topH / 2;
      addPanel(reg, key, g, A, n++, p, cy, w, topH);
    }
  }
}

function addPanel(
  reg: Registry,
  key: WallKey,
  g: ReturnType<typeof wallGeom>,
  A: string,
  n: number,
  p: { x: number; z: number },
  y: number,
  along: number,
  h: number,
) {
  const local: Vec3 = [g.outward[0] * 0.85, 0.05, g.outward[2] * 0.85];
  reg.add({
    id: `${A}.sheathing.${n}`,
    type: "wall-sheathing",
    label: `${cap(key)} wall sheathing ${n + 1}`,
    parentId: A,
    geometry: { kind: "box", center: [p.x, y, p.z], size: g.lumber(along - 0.004, h, P.sheathing) },
    material: MAT.osb,
    assembly: {
      stage: 10,
      dependencies: [`${A}.stud.00`, `${A}.plate.bottom`],
      explodeGroup: A,
      explodeVector: [g.whole[0] + g.outward[0] * 0.4, g.whole[1], g.whole[2] + g.outward[2] * 0.4],
      localExplodeVector: local,
    },
    structural: { loadPathRole: "wall-sheathing" },
    learning: learn("Wood panels on the outside of the studs.", "Brace the wall in shear and give a surface for later cladding (cladding is not in v0.1)."),
    provenance: PROV_MODEL,
    tags: ["wall", key, "sheathing"],
  });
}

function cap(s: string): string {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}
