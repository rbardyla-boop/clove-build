import type { SystemGraph } from "@/crates/building-graph/types";
import { buildWoodSlab, freezeGraph, type WoodSlabOptions } from "../kit/wood-slab";
import { addDeckPoolHotTub, recreationAttachments, recreationRelations, recreationSystems } from "../kit/recreation";

const OPTIONS: WoodSlabOptions = {
  id: "PEI-RURAL-POOL-001",
  title: "PEI rural cottage with deck, hot tub and pool",
  L: 8.0,
  W: 6.4,
  pitch: 5 / 12,
  overhang: 0.45,
  openings: [
    { wall: "front", id: "D1", kind: "door", s: 0, w: 1.6, h: 2.03, sill: 0 },
    { wall: "front", id: "W1", kind: "window", s: -2.2, w: 0.9, h: 1.1, sill: 0.9 },
    { wall: "back", id: "W2", kind: "window", s: 0.3, w: 1.4, h: 1.1, sill: 0.9 },
    { wall: "left", id: "W3", kind: "window", s: 0.2, w: 1.0, h: 1.0, sill: 1.0 },
    { wall: "right", id: "W4", kind: "window", s: -0.6, w: 1.1, h: 1.1, sill: 0.9 },
  ],
  kitchen: { x: -2.6, z: 2.7 },
  bath: { x: 3.1, z: -1.4 },
  stack: { x: 3.1, z: -1.1 },
  heater: { x: -3.2, z: -2.4 },
  panel: { x: -3.55, z: -2.75 },
  indoorHead: { x: 0.2, z: -2.9 },
  outdoorUnit: { x: 0.2, z: -4.05 },
};

export function buildRuralPoolHouse() {
  const kit = buildWoodSlab(OPTIONS);
  addDeckPoolHotTub(kit.reg, kit.dims);
  const extraEl: SystemGraph = {
    id: "system.electrical.pool",
    trade: "electrical",
    nodes: [
      { id: "electrical.panel.main", componentId: "electrical.panel.main", kind: "panel", label: "Cottage panel" },
      { id: "electrical.disconnect.pool", componentId: "electrical.disconnect.pool", kind: "disconnect", label: "Pool disconnect" },
      { id: "electrical.bonding.pool", componentId: "electrical.bonding.pool", kind: "bonding", label: "Pool bonding" },
      { id: "hottub.001", componentId: "hottub.001", kind: "hot-tub", label: "Hot tub" },
    ],
    connections: [
      { id: "el.pool.feed", from: "electrical.panel.main", to: "electrical.disconnect.pool", kind: "feeder" },
      { id: "el.pool.bond", from: "electrical.disconnect.pool", to: "electrical.bonding.pool", kind: "bonding" },
      { id: "el.tub", from: "electrical.disconnect.pool", to: "hottub.001", kind: "branch" },
    ],
  };
  return freezeGraph("PEI-RURAL-POOL-001", "PEI rural cottage with deck, hot tub and pool", kit, {
    systems: [...recreationSystems(), extraEl],
    relations: recreationRelations(),
    attachments: recreationAttachments(),
  });
}
