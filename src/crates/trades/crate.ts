import type { TradeId } from "@/crates/building-graph/types";
import { TRADE_CHALLENGES, type LearningChallenge } from "./challenges";
import { TRADE_IDS } from "./infer";

export type { TradeId };

export type ConstructionStageRef = {
  id: number;
  key: string;
  label: string;
};

export type TradeCrate = {
  id: TradeId;
  label: string;
  componentIds: string[];
  constructionStages: ConstructionStageRef[];
  challengeIds: string[];
};

export const TRADE_LABELS: Record<TradeId, string> = {
  foundation: "Foundation",
  structure: "Structure",
  envelope: "Envelope",
  plumbing: "Plumbing",
  electrical: "Electrical",
  hvac: "HVAC",
  thermal: "Thermal",
  finish: "Finish",
};

const STAGE_BY_TRADE: Record<TradeId, ConstructionStageRef[]> = {
  foundation: [
    { id: 1, key: "site", label: "Site" },
    { id: 2, key: "excavation", label: "Excavation" },
    { id: 3, key: "footing", label: "Footings" },
    { id: 4, key: "foundation", label: "Foundation" },
  ],
  structure: [
    { id: 5, key: "sill", label: "Sill" },
    { id: 6, key: "floor", label: "Floor framing" },
    { id: 7, key: "subfloor", label: "Subfloor" },
    { id: 8, key: "walls", label: "Walls" },
    { id: 9, key: "openings", label: "Openings" },
    { id: 10, key: "sheathing", label: "Sheathing" },
    { id: 11, key: "roof-frame", label: "Roof framing" },
    { id: 12, key: "roof-deck", label: "Roof sheathing" },
  ],
  envelope: [
    { id: 13, key: "envelope", label: "Dry-in" },
    { id: 14, key: "roofing", label: "Roofing & cladding" },
  ],
  plumbing: [{ id: 15, key: "rough-plumbing", label: "Rough plumbing" }],
  hvac: [{ id: 16, key: "rough-hvac", label: "Rough HVAC" }],
  electrical: [{ id: 17, key: "rough-electrical", label: "Rough electrical" }],
  thermal: [{ id: 19, key: "thermal", label: "Insulation & control layers" }],
  finish: [
    { id: 20, key: "drywall", label: "Drywall" },
    { id: 21, key: "devices", label: "Trim & devices" },
    { id: 22, key: "finish", label: "Interior finish" },
  ],
};

export function tradeCrates(componentTrade: (id: string) => TradeId, componentIds: string[]): TradeCrate[] {
  return TRADE_IDS.map((id) => ({
    id,
    label: TRADE_LABELS[id],
    componentIds: componentIds.filter((cid) => componentTrade(cid) === id),
    constructionStages: STAGE_BY_TRADE[id],
    challengeIds: TRADE_CHALLENGES.filter((c) => c.trade === id).map((c) => c.id),
  }));
}

export function challengesFor(trade: TradeId): LearningChallenge[] {
  return TRADE_CHALLENGES.filter((c) => c.trade === trade);
}
