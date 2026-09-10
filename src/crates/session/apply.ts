import { clampAmount, type ExplodeScope } from "@/crates/explode/engine";
import { clampStage, STAGE_MAX, STAGE_MIN } from "@/crates/construction-sequence/stages";
import { evaluateRules, highlightedIds } from "@/crates/rule-engine/engine";
import type { RuleEvaluation } from "@/crates/rule-engine/types";
import type { BuildingGraph } from "@/crates/building-graph/types";
import { WINDOW_CHALLENGE } from "@/crates/break-it/challenge";
import type { Command, LabEvent, LabMode } from "./commands";

/**
 * v1 session overlay.
 * `graph` is the planned specimen, not as-built.
 * `constructionStage` is the educational sequence, not observed progress.
 * `removedIds` is Break It, not demolition evidence.
 * Do not store EvidenceRecord here in v1.
 */
export type LabSnapshot = {
  graph: BuildingGraph;
  selectedId: string | null;
  explodeAmount: number;
  explodeScope: ExplodeScope;
  constructionStage: number;
  playing: boolean;
  removedIds: string[];
  hiddenIds: string[];
  isolatedIds: string[] | null;
  mode: LabMode;
  xray: boolean;
  sectionEnabled: boolean;
  sectionOffset: number;
  check: RuleEvaluation[] | null;
  checkHighlights: string[];
  challengeActive: boolean;
  showDiag: boolean;
  showReceipt: boolean;
  showRyanTest: boolean;
  events: LabEvent[];
  seq: number;
  cameraNonce: number;
  cameraCommand: "reset" | "fit-house" | "fit-selected" | null;
};

export function createSnapshot(graph: BuildingGraph): LabSnapshot {
  return {
    graph,
    selectedId: null,
    explodeAmount: 0,
    explodeScope: "whole",
    constructionStage: STAGE_MAX,
    playing: false,
    removedIds: [],
    hiddenIds: [],
    isolatedIds: null,
    mode: "inspect",
    xray: false,
    sectionEnabled: false,
    sectionOffset: 0,
    check: null,
    checkHighlights: [],
    challengeActive: false,
    showDiag: false,
    showReceipt: false,
    showRyanTest: false,
    events: [],
    seq: 0,
    cameraNonce: 0,
    cameraCommand: null,
  };
}

export function applyCommand(state: LabSnapshot, command: Command, now = Date.now()): LabSnapshot {
  const event: LabEvent = { ...command, at: now, seq: state.seq + 1 };
  const events = [...state.events, event].slice(-240);
  const base = { ...state, events, seq: event.seq, cameraCommand: null };

  switch (command.type) {
    case "SELECT_COMPONENT":
      return { ...base, selectedId: command.id };
    case "SET_EXPLODE":
      return { ...base, explodeAmount: clampAmount(command.amount) };
    case "SET_EXPLODE_SCOPE":
      return { ...base, explodeScope: command.scope };
    case "SET_CONSTRUCTION_STAGE":
      return { ...base, constructionStage: clampStage(command.stage) };
    case "PLAY_SEQUENCE":
      return { ...base, playing: command.playing };
    case "REMOVE_COMPONENT": {
      if (state.mode !== "break-it") return state;
      if (!state.graph.components[command.id]) return state;
      if (state.graph.components[command.id]!.geometry.kind === "group") return state;
      if (state.removedIds.includes(command.id)) return state;
      return {
        ...base,
        removedIds: [...state.removedIds, command.id],
        selectedId: state.selectedId === command.id ? command.id : state.selectedId,
        check: null,
        checkHighlights: [],
      };
    }
    case "RESTORE_COMPONENT":
      return {
        ...base,
        removedIds: state.removedIds.filter((id) => id !== command.id),
        check: null,
        checkHighlights: [],
      };
    case "RESTORE_ALL":
      return { ...base, removedIds: [], check: null, checkHighlights: [] };
    case "HIDE_COMPONENT":
      if (state.hiddenIds.includes(command.id)) return state;
      return { ...base, hiddenIds: [...state.hiddenIds, command.id] };
    case "SHOW_COMPONENT":
      return { ...base, hiddenIds: state.hiddenIds.filter((id) => id !== command.id) };
    case "ISOLATE":
      return { ...base, isolatedIds: command.ids };
    case "SET_MODE":
      return { ...base, mode: command.mode };
    case "SET_XRAY":
      return { ...base, xray: command.enabled };
    case "SET_SECTION":
      return {
        ...base,
        sectionEnabled: command.enabled,
        sectionOffset: command.offset ?? state.sectionOffset,
      };
    case "RUN_CHECK": {
      const results = evaluateRules(state.graph, {
        jurisdictionId: state.graph.jurisdictionId,
        projectDate: state.graph.projectDate,
        removedIds: state.removedIds,
        hiddenIds: state.hiddenIds,
        now: new Date(now).toISOString(),
      });
      return { ...base, check: results, checkHighlights: highlightedIds(results) };
    }
    case "CLEAR_CHECK":
      return { ...base, check: null, checkHighlights: [] };
    case "RESET_SPECIMEN":
      return {
        ...createSnapshot(state.graph),
        seq: event.seq,
        events: [...events, { type: "RESET_SPECIMEN", at: now, seq: event.seq }],
        cameraNonce: state.cameraNonce + 1,
        cameraCommand: "reset",
      };
    case "RESET_CAMERA":
      return { ...base, cameraNonce: state.cameraNonce + 1, cameraCommand: "reset" };
    case "FIT_HOUSE":
      return { ...base, cameraNonce: state.cameraNonce + 1, cameraCommand: "fit-house" };
    case "FIT_SELECTED":
      return { ...base, cameraNonce: state.cameraNonce + 1, cameraCommand: "fit-selected" };
    case "SET_CHALLENGE":
      return {
        ...base,
        challengeActive: command.active,
        mode: command.active ? "break-it" : state.mode,
        selectedId: command.active ? WINDOW_CHALLENGE.focusId : state.selectedId,
        explodeScope: command.active ? WINDOW_CHALLENGE.targetAssembly : state.explodeScope,
        xray: command.active ? true : state.xray,
      };
    case "TOGGLE_DIAG":
      return { ...base, showDiag: !state.showDiag };
    case "TOGGLE_RECEIPT":
      return { ...base, showReceipt: !state.showReceipt, showRyanTest: false };
    case "TOGGLE_RYAN_TEST":
      return { ...base, showRyanTest: !state.showRyanTest, showReceipt: false };
    default:
      return state;
  }
}

export function resetEqualsBaseline(a: LabSnapshot, b: LabSnapshot): boolean {
  return (
    a.removedIds.length === 0 &&
    b.removedIds.length === 0 &&
    a.explodeAmount === 0 &&
    a.constructionStage === STAGE_MAX &&
    a.hiddenIds.length === 0 &&
    a.isolatedIds === null
  );
}

export { STAGE_MIN, STAGE_MAX };
