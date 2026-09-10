import type { BuildingComponent, ComponentType, TradeId } from "@/crates/building-graph/types";

const FOUNDATION: ReadonlySet<ComponentType> = new Set([
  "site",
  "excavation",
  "footing",
  "foundation-wall",
  "pad-footing",
  "slab",
]);

const ENVELOPE: ReadonlySet<ComponentType> = new Set([
  "window-unit",
  "door-unit",
  "flashing",
  "wrb",
  "underlayment",
  "cladding",
  "roof-covering",
  "rainscreen",
]);

const PLUMBING: ReadonlySet<ComponentType> = new Set([
  "pipe-supply",
  "pipe-dwv",
  "pipe-vent",
  "fitting",
  "fixture",
  "trap",
  "water-heater",
]);

const ELECTRICAL: ReadonlySet<ComponentType> = new Set([
  "panel",
  "breaker",
  "cable",
  "device-box",
  "receptacle",
  "switch",
  "luminaire",
  "service-entry",
  "bonding",
]);

const HVAC: ReadonlySet<ComponentType> = new Set([
  "heat-pump-indoor",
  "heat-pump-outdoor",
  "duct",
  "terminal",
  "exhaust",
  "hrv",
  "refrigerant-line",
  "condensate",
]);

const THERMAL: ReadonlySet<ComponentType> = new Set(["insulation", "air-barrier", "vapour-barrier"]);

const FINISH: ReadonlySet<ComponentType> = new Set(["drywall", "trim", "floor-finish", "paint"]);

export const TRADE_IDS: TradeId[] = [
  "foundation",
  "structure",
  "envelope",
  "plumbing",
  "electrical",
  "hvac",
  "thermal",
  "finish",
];

export function tradeOf(c: BuildingComponent): TradeId {
  if (c.trade) return c.trade;
  const t = c.type;
  if (FOUNDATION.has(t)) return "foundation";
  if (ENVELOPE.has(t)) return "envelope";
  if (PLUMBING.has(t)) return "plumbing";
  if (ELECTRICAL.has(t)) return "electrical";
  if (HVAC.has(t)) return "hvac";
  if (THERMAL.has(t)) return "thermal";
  if (FINISH.has(t)) return "finish";
  if (t === "penetration") {
    const tag = c.tags?.find((x) => TRADE_IDS.includes(x as TradeId));
    return (tag as TradeId | undefined) ?? "structure";
  }
  return "structure";
}

export type TradeLayerState = "on" | "off" | "ghost";

export function defaultTradeLayers(): Record<TradeId, TradeLayerState> {
  return {
    foundation: "on",
    structure: "on",
    envelope: "on",
    plumbing: "on",
    electrical: "on",
    hvac: "on",
    thermal: "on",
    finish: "on",
  };
}
