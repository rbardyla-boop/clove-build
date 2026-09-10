import { buildWoodSlab, freezeGraph, type WoodSlabOptions } from "../kit/wood-slab";

const OPTIONS: WoodSlabOptions = {
  id: "PEI-SLAB-COTTAGE-001",
  title: "PEI slab-on-grade cottage",
  L: 7.2,
  W: 6.0,
  pitch: 4 / 12,
  overhang: 0.4,
  openings: [
    { wall: "front", id: "D1", kind: "door", s: -2.1, w: 0.86, h: 2.03, sill: 0 },
    { wall: "front", id: "W1", kind: "window", s: 1.7, w: 1.2, h: 1.1, sill: 0.9 },
    { wall: "back", id: "W2", kind: "window", s: 0.2, w: 1.4, h: 1.1, sill: 0.9 },
    { wall: "left", id: "W3", kind: "window", s: -1.1, w: 0.9, h: 1.0, sill: 1.0 },
    { wall: "right", id: "W4", kind: "window", s: 0.4, w: 1.1, h: 1.1, sill: 0.9 },
  ],
  kitchen: { x: 1.8, z: 2.55 },
  bath: { x: -2.55, z: -1.5 },
  stack: { x: -2.55, z: -1.15 },
  heater: { x: 2.7, z: -2.2 },
  panel: { x: 2.85, z: -2.55 },
  indoorHead: { x: 0.6, z: -2.7 },
  outdoorUnit: { x: 0.6, z: -3.75 },
};

export function buildSlabCottage() {
  return freezeGraph("PEI-SLAB-COTTAGE-001", "PEI slab-on-grade cottage", buildWoodSlab(OPTIONS));
}
