import type { TradeId } from "@/crates/building-graph/types";
import { WINDOW_CHALLENGE } from "@/crates/break-it/challenge";

export type LearningChallenge = {
  id: string;
  trade: TradeId | "cross-trade";
  title: string;
  prompt: string;
  targetAssembly: string;
  focusId: string;
  hintAfterCheck: string;
  checkHintRuleId?: string;
  removableHintIds: readonly string[];
  criticalIds: readonly string[];
};

export const PLUMBING_CHALLENGE: LearningChallenge = {
  id: "challenge.plumbing.where-water-goes",
  trade: "plumbing",
  title: "Where does the water go?",
  prompt:
    "Remove or disconnect one plumbing part you think the bathroom can live without, then run CHECK SYSTEM. Topology is the teacher — this is not a plumbing-code prosecution.",
  targetAssembly: "assembly.wall.bath",
  focusId: "plumbing.dwv.trap.lav.001",
  hintAfterCheck: "A lavatory that no longer reaches the stack is a broken drain path in this specimen, not an invented NPC clause.",
  checkHintRuleId: "PLUMB-TOPOLOGY-001",
  removableHintIds: ["plumbing.dwv.trap.lav.001"],
  criticalIds: ["plumbing.dwv.stack.001", "plumbing.dwv.building-drain.001", "plumbing.dwv.trap.lav.001"],
};

export const ELECTRICAL_CHALLENGE: LearningChallenge = {
  id: "challenge.electrical.open-path",
  trade: "electrical",
  title: "Open the circuit",
  prompt:
    "Disconnect a device from its branch inside this simulation. Then TRACE and CHECK. Do not treat this as advice for bypassing protection in a real installation.",
  targetAssembly: "assembly.wall.front",
  focusId: "electrical.cable.receptacles.001",
  hintAfterCheck: "If the cable is gone, the receptacle no longer reaches the panel. That is topology, not a CEC inspection.",
  checkHintRuleId: "ELEC-TOPOLOGY-001",
  removableHintIds: ["electrical.cable.receptacles.001"],
  criticalIds: ["electrical.panel.main", "electrical.device.receptacle.front.001"],
};

export const HVAC_CHALLENGE: LearningChallenge = {
  id: "challenge.hvac.exhaust-path",
  trade: "hvac",
  title: "Break the exhaust path",
  prompt: "Remove the bathroom exhaust duct or fan, then CHECK. Moisture has to go somewhere — in this model, that is a duct to outdoors.",
  targetAssembly: "assembly.wall.bath",
  focusId: "hvac.exhaust.bath.duct",
  hintAfterCheck: "A fan with no path to an outlet is a disconnected exhaust topology. Ventilation rates are not calculated here.",
  checkHintRuleId: "HVAC-TOPOLOGY-001",
  removableHintIds: ["hvac.exhaust.bath.duct"],
  criticalIds: ["hvac.exhaust.bath.001", "hvac.exhaust.bath.outlet"],
};

export const ENVELOPE_CHALLENGE: LearningChallenge = {
  id: "challenge.envelope.window-flashing",
  trade: "envelope",
  title: "The window pan",
  prompt: "On the teaching window, remove the layer you believe is decorative. Then CHECK. Water control is a layer, not a colour.",
  targetAssembly: "assembly.wall.front",
  focusId: "envelope.window.front.001.flashing",
  hintAfterCheck: "Sill flashing is a water-control layer in this specimen. Removing it is a building-science demonstration, not an NBC quote.",
  checkHintRuleId: "ENV-FLASHING-001",
  removableHintIds: ["envelope.wall.front.rainscreen"],
  criticalIds: ["envelope.window.front.001.flashing", "envelope.wall.front.wrb"],
};

export const THERMAL_CHALLENGE: LearningChallenge = {
  id: "challenge.thermal.air-control",
  trade: "thermal",
  title: "Break the air-control plane",
  prompt: "Remove the front-wall air-control layer, then CHECK. Continuity is the lesson — this is not a blower-door test.",
  targetAssembly: "assembly.wall.front",
  focusId: "thermal.wall.front.air-barrier",
  hintAfterCheck: "The air-control layer of the teaching wall is missing. That is an educational continuity failure, not a measured ACH50.",
  checkHintRuleId: "THERM-AIR-001",
  removableHintIds: [],
  criticalIds: ["thermal.wall.front.air-barrier"],
};

export const CROSS_CHALLENGE: LearningChallenge = {
  id: "challenge.cross.service-wall",
  trade: "cross-trade",
  title: "The service wall",
  prompt:
    "This finished wall belongs to many systems at once. Open it. Remove what you believe is unnecessary. Then CHECK WHOLE ASSEMBLY. Regulatory approval is not claimed.",
  targetAssembly: "assembly.wall.bath",
  focusId: "finish.drywall.bath.panel.001",
  hintAfterCheck: "One wall, several graphs. A topology miss is not automatically a code violation.",
  removableHintIds: ["finish.paint.bath"],
  criticalIds: [
    "assembly.wall.bath.stud.00",
    "plumbing.dwv.stack.001",
    "electrical.cable.bath.002",
    "hvac.exhaust.bath.duct",
  ],
};

export const STRUCTURAL_CHALLENGE: LearningChallenge = {
  id: WINDOW_CHALLENGE.id,
  trade: "structure",
  title: WINDOW_CHALLENGE.title,
  prompt: WINDOW_CHALLENGE.prompt,
  targetAssembly: WINDOW_CHALLENGE.targetAssembly,
  focusId: WINDOW_CHALLENGE.focusId,
  hintAfterCheck: WINDOW_CHALLENGE.hintAfterCheck,
  checkHintRuleId: "DEMO-OPENING-001",
  removableHintIds: WINDOW_CHALLENGE.removableHintIds,
  criticalIds: WINDOW_CHALLENGE.criticalIds,
};

export const ROUTE_CHALLENGE: LearningChallenge = {
  id: "challenge.cross.occupied-route",
  trade: "cross-trade",
  title: "A pipe through the room",
  prompt:
    "An overlay fault places a supply run through occupied living space. Run CHECK. This is the error finder — not a mutation of the planned house. Reset clears it.",
  targetAssembly: "assembly.plumbing",
  focusId: "fault.midroom-pipe",
  hintAfterCheck: "CROSS-ROUTE-001 should FAIL on the overlay pipe. The canonical graph hash must not change.",
  checkHintRuleId: "CROSS-ROUTE-001",
  removableHintIds: [],
  criticalIds: ["plumbing.supply.cold.kitchen.001"],
};

export const TRADE_CHALLENGES: LearningChallenge[] = [
  STRUCTURAL_CHALLENGE,
  ENVELOPE_CHALLENGE,
  PLUMBING_CHALLENGE,
  ELECTRICAL_CHALLENGE,
  HVAC_CHALLENGE,
  THERMAL_CHALLENGE,
  CROSS_CHALLENGE,
  ROUTE_CHALLENGE,
];

export function challengeById(id: string | null | undefined): LearningChallenge | undefined {
  if (!id) return STRUCTURAL_CHALLENGE;
  return TRADE_CHALLENGES.find((c) => c.id === id);
}
