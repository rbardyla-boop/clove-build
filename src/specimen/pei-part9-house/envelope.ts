import { addAssembly, addBox, MAT, PROV_SCIENCE } from "./helper";
import { ALPHA, P, Y, halfL, halfW } from "./params";
import type { Registry } from "./registry";

const LEARN_COMMON =
  "This is a common Canadian Part 9 demonstration assembly, not the only valid wall. Water control, air control, vapour control and thermal control are distinct layers.";

export function addEnvelope(reg: Registry) {
  addAssembly(reg, {
    id: "assembly.envelope",
    label: "Exterior envelope",
    trade: "envelope",
    center: [0, (Y.floorTop + Y.ridgeY) / 2, 0],
    size: [P.length + 0.4, Y.ridgeY - Y.floorTop + 0.4, P.width + 0.4],
    stage: 13,
    dependencies: ["assembly.wall.front", "assembly.roof"],
    short: "Water-control and cladding layers over the wood frame.",
    purpose: "Dry the building in so interiors can proceed.",
    tags: ["envelope"],
  });

  const walls: { key: string; center: [number, number, number]; size: [number, number, number]; out: [number, number, number] }[] = [
    { key: "front", center: [0, (Y.floorTop + Y.wallTop) / 2, halfW + 0.02], size: [P.length, Y.wallTop - Y.floorTop, 0.012], out: [0, 0.2, 2.4] },
    { key: "back", center: [0, (Y.floorTop + Y.wallTop) / 2, -halfW - 0.02], size: [P.length, Y.wallTop - Y.floorTop, 0.012], out: [0, 0.2, -2.4] },
    { key: "left", center: [-halfL - 0.02, (Y.floorTop + Y.wallTop) / 2, 0], size: [0.012, Y.wallTop - Y.floorTop, P.width], out: [-2.4, 0.2, 0] },
    { key: "right", center: [halfL + 0.02, (Y.floorTop + Y.wallTop) / 2, 0], size: [0.012, Y.wallTop - Y.floorTop, P.width], out: [2.4, 0.2, 0] },
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
      localExplodeVector: [w.out[0] * 0.35, 0.1, w.out[2] * 0.35],
      tradeExplodeVector: w.out,
      tags: ["envelope", "water-control", w.key],
      short: "A thin weather-resistive layer over sheathing.",
      purpose: "Shed bulk water that gets past cladding. This is a building-science control layer, not a unique code-prescribed product.",
      provenance: PROV_SCIENCE,
      visualization: "BUILDING-SCIENCE VISUALIZATION",
      dependencies: [`assembly.wall.${w.key}`],
    });

    const clad = w.size.map((v, i) => (i === 1 ? v : v)) as [number, number, number];
    const cladCenter: [number, number, number] = [
      w.center[0] + Math.sign(w.out[0]) * 0.018,
      w.center[1],
      w.center[2] + Math.sign(w.out[2]) * 0.018,
    ];
    addBox(reg, {
      id: `envelope.wall.${w.key}.cladding`,
      type: "cladding",
      label: `${cap(w.key)} cladding`,
      parentId: `assembly.wall.${w.key}`,
      trade: "envelope",
      center: cladCenter,
      size: [w.size[0] + (w.key === "left" || w.key === "right" ? 0 : 0), w.size[1], w.size[2] + (w.key === "front" || w.key === "back" ? 0 : 0)].map((v, i) =>
        i === 0 && (w.key === "left" || w.key === "right") ? 0.016 : i === 2 && (w.key === "front" || w.key === "back") ? 0.016 : v,
      ) as [number, number, number],
      material: MAT.cladding,
      stage: 14,
      explodeGroup: `assembly.wall.${w.key}`,
      explodeVector: [w.out[0] * 1.15, w.out[1], w.out[2] * 1.15],
      localExplodeVector: [w.out[0] * 0.5, 0.1, w.out[2] * 0.5],
      tradeExplodeVector: w.out,
      tags: ["envelope", "cladding", w.key],
      short: "Lap siding as a rainscreen cladding concept.",
      purpose: "The exterior finish and first water-shedding surface. Drainage space is simplified.",
      provenance: PROV_SCIENCE,
      dependencies: [`envelope.wall.${w.key}.wrb`],
    });
  }

  addBox(reg, {
    id: "envelope.wall.front.rainscreen",
    type: "rainscreen",
    label: "Front wall drainage space (concept)",
    parentId: "assembly.wall.front",
    trade: "envelope",
    center: [0, (Y.floorTop + Y.wallTop) / 2, halfW + 0.028],
    size: [P.length, Y.wallTop - Y.floorTop, 0.01],
    material: MAT.wrap,
    stage: 14,
    explodeGroup: "assembly.wall.front",
    explodeVector: [0, 0.15, 2.7],
    localExplodeVector: [0, 0.05, 0.55],
    tradeExplodeVector: [0, 0.1, 2.6],
    tags: ["envelope", "water-control", "front", "window-wall"],
    short: "A conceptual drainage gap between WRB and cladding on the teaching wall.",
    purpose: "Show that cladding is not the only water-control plane. Gap thickness is educational.",
    provenance: PROV_SCIENCE,
    visualization: "BUILDING-SCIENCE VISUALIZATION",
    dependencies: ["envelope.wall.front.wrb"],
  });

  const openings = [
    { id: "envelope.window.front.001", wall: "front", label: "Front window W1", x: 0.2, z: halfW - 0.04, w: 1.22, h: 1.2, sill: 0.9 },
    { id: "envelope.window.front.002", wall: "front", label: "Front window W2", x: 2.75, z: halfW - 0.04, w: 1.22, h: 1.2, sill: 0.9 },
    { id: "envelope.door.front.001", wall: "front", label: "Front door D1", x: -2.55, z: halfW - 0.04, w: 0.86, h: 2.03, sill: 0, type: "door-unit" as const },
    { id: "envelope.window.back.001", wall: "back", label: "Back window W3", x: 0.15, z: -halfW + 0.04, w: 1.47, h: 1.2, sill: 0.9 },
    { id: "envelope.window.left.001", wall: "left", label: "Left window W4", x: -halfL + 0.04, z: 0.4, w: 1.02, h: 1.2, sill: 0.9 },
    { id: "envelope.window.right.001", wall: "right", label: "Right window W5", x: halfL - 0.04, z: -0.9, w: 1.02, h: 1.2, sill: 0.9 },
  ];

  for (const o of openings) {
    const y = Y.floorTop + o.sill + o.h / 2;
    const isLeftRight = o.wall === "left" || o.wall === "right";
    addBox(reg, {
      id: o.id,
      type: o.type ?? "window-unit",
      label: o.label,
      parentId: `assembly.wall.${o.wall}`,
      trade: "envelope",
      center: [o.x, y, o.z],
      size: isLeftRight ? [0.09, o.h, o.w] : [o.w, o.h, 0.09],
      material: MAT.glass,
      stage: 13,
      explodeGroup: `assembly.wall.${o.wall}`,
      explodeVector: o.wall === "front" ? [0, 0.2, 2.2] : o.wall === "back" ? [0, 0.2, -2.2] : o.wall === "left" ? [-2.2, 0.2, 0] : [2.2, 0.2, 0],
      localExplodeVector: o.wall === "front" ? [0, 0.1, 0.7] : [0, 0.1, 0],
      tradeExplodeVector: [0, 0.4, 1.6],
      tags: ["envelope", "opening", o.wall, o.id.includes("001") && o.wall === "front" ? "window-wall" : "opening"],
      short: "A factory window or door unit in the framed opening.",
      purpose: "Close the opening and carry flashing. Performance ratings are not evaluated here.",
      dependencies: [`assembly.wall.${o.wall}`],
    });
  }

  addBox(reg, {
    id: "envelope.window.front.001.flashing",
    type: "flashing",
    label: "W1 sill flashing",
    parentId: "assembly.wall.front",
    trade: "envelope",
    center: [0.2, Y.floorTop + 0.88, halfW + 0.01],
    size: [1.34, 0.02, 0.12],
    material: MAT.steel,
    stage: 13,
    explodeGroup: "assembly.wall.front",
    explodeVector: [0, -0.15, 2.5],
    localExplodeVector: [0, -0.25, 0.8],
    tradeExplodeVector: [0, -0.4, 2.2],
    tags: ["envelope", "water-control", "window-wall", "front"],
    short: "Sill pan flashing at the teaching window.",
    purpose: "Direct water that enters the window opening back out onto the WRB. Detail is educational.",
    provenance: PROV_SCIENCE,
    visualization: "BUILDING-SCIENCE VISUALIZATION",
    dependencies: ["envelope.window.front.001", "envelope.wall.front.wrb"],
  });

  const roofLen = P.length + P.overhang * 2;
  const slope = Math.hypot(halfW + P.overhang, (halfW + P.overhang) * P.pitch);
  const southY = (Y.wallTop + Y.ridgeY) / 2 + 0.05;
  const northY = southY;
  const southZ = (halfW + P.overhang) / 2;
  addBox(reg, {
    id: "envelope.roof.underlayment.south",
    type: "underlayment",
    label: "Roof underlayment (south)",
    parentId: "assembly.roof",
    trade: "envelope",
    center: [0, southY, southZ],
    size: [roofLen, 0.01, slope],
    rotation: [ALPHA, 0, 0],
    material: MAT.felt,
    stage: 13,
    explodeGroup: "assembly.roof",
    explodeVector: [0, 2.4, 1.2],
    localExplodeVector: [0, 0.35, 0.2],
    tradeExplodeVector: [0, 2.6, 1.4],
    tags: ["envelope", "water-control", "roof"],
    short: "A roof water-control sheet over the deck.",
    purpose: "Backup water control under the finished roof covering.",
    provenance: PROV_SCIENCE,
    dependencies: ["assembly.roof"],
  });
  addBox(reg, {
    id: "envelope.roof.underlayment.north",
    type: "underlayment",
    label: "Roof underlayment (north)",
    parentId: "assembly.roof",
    trade: "envelope",
    center: [0, northY, -southZ],
    size: [roofLen, 0.01, slope],
    rotation: [-ALPHA, 0, 0],
    material: MAT.felt,
    stage: 13,
    explodeGroup: "assembly.roof",
    explodeVector: [0, 2.4, -1.2],
    localExplodeVector: [0, 0.35, -0.2],
    tradeExplodeVector: [0, 2.6, -1.4],
    tags: ["envelope", "water-control", "roof"],
    short: "North roof underlayment.",
    purpose: "Backup water control under the finished roof covering.",
    provenance: PROV_SCIENCE,
    dependencies: ["assembly.roof"],
  });
  addBox(reg, {
    id: "envelope.roof.covering.south",
    type: "roof-covering",
    label: "Asphalt shingles (south)",
    parentId: "assembly.roof",
    trade: "envelope",
    center: [0, southY + 0.02, southZ],
    size: [roofLen, 0.012, slope],
    rotation: [ALPHA, 0, 0],
    material: MAT.shingle,
    stage: 14,
    explodeGroup: "assembly.roof",
    explodeVector: [0, 2.8, 1.4],
    localExplodeVector: [0, 0.5, 0.25],
    tradeExplodeVector: [0, 3.0, 1.6],
    tags: ["envelope", "roof"],
    short: "Finished roof covering on the south slope.",
    purpose: "The primary roof water-shedding surface of this specimen.",
    dependencies: ["envelope.roof.underlayment.south"],
  });
  addBox(reg, {
    id: "envelope.roof.covering.north",
    type: "roof-covering",
    label: "Asphalt shingles (north)",
    parentId: "assembly.roof",
    trade: "envelope",
    center: [0, northY + 0.02, -southZ],
    size: [roofLen, 0.012, slope],
    rotation: [-ALPHA, 0, 0],
    material: MAT.shingle,
    stage: 14,
    explodeGroup: "assembly.roof",
    explodeVector: [0, 2.8, -1.4],
    localExplodeVector: [0, 0.5, -0.25],
    tradeExplodeVector: [0, 3.0, -1.6],
    tags: ["envelope", "roof"],
    short: "Finished roof covering on the north slope.",
    purpose: "The primary roof water-shedding surface of this specimen.",
    dependencies: ["envelope.roof.underlayment.north"],
  });
}

function cap(s: string) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}
