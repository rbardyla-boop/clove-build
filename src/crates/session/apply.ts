import { clampAmount, type ExplodeScope } from "@/crates/explode/engine";
import { clampStage, STAGE_MAX, STAGE_MIN } from "@/crates/construction-sequence/stages";
import { evaluateRules, highlightedIds } from "@/crates/rule-engine/engine";
import type { RuleEvaluation } from "@/crates/rule-engine/types";
import type { BuildingGraph, TradeId } from "@/crates/building-graph/types";
import { challengeById } from "@/crates/trades/challenges";
import { defaultTradeLayers, tradeOf, type TradeLayerState } from "@/crates/trades/infer";
import { traceFromComponent, type TraceKind } from "@/crates/system-graph/trace";
import { searchComponents, type SearchHit } from "@/crates/search/index";
import { FAULT_MIDROOM, graphWithFaults } from "@/crates/break-it/faults";
import { descendants } from "@/crates/building-graph/integrity";
import type { Command, FlowMode, LabEvent, LabMode, TraceState, ViewDepth } from "./commands";

/**
 * v1 session overlay.
 * `graph` is the planned specimen, not as-built.
 * `constructionStage` is the educational sequence, not observed progress.
 * `removedIds` is Break It, not demolition evidence.
 * `faultIds` are overlay demonstrations; they never rewrite the planned graph.
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
  challengeId: string;
  showDiag: boolean;
  showReceipt: boolean;
  showRyanTest: boolean;
  tradeLayers: Record<TradeId, TradeLayerState>;
  flowMode: FlowMode;
  hideFinish: boolean;
  trace: TraceState;
  viewDepth: ViewDepth;
  searchQuery: string;
  searchHits: SearchHit[];
  faultIds: string[];
  lessonId: string | null;
  events: LabEvent[];
  seq: number;
  cameraNonce: number;
  cameraCommand: "reset" | "fit-house" | "fit-selected" | null;
};

export function workingGraph(state: Pick<LabSnapshot, "graph" | "faultIds">): BuildingGraph {
  return graphWithFaults(state.graph, state.faultIds);
}

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
    challengeId: "challenge.window-opening",
    showDiag: false,
    showReceipt: false,
    showRyanTest: false,
    tradeLayers: defaultTradeLayers(),
    flowMode: "off",
    hideFinish: false,
    trace: null,
    viewDepth: "learn",
    searchQuery: "",
    searchHits: [],
    faultIds: [],
    lessonId: null,
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
      if (!state.graph.components[command.id] && command.id !== FAULT_MIDROOM) return state;
      if (state.graph.components[command.id]?.geometry.kind === "group") return state;
      if (state.removedIds.includes(command.id)) return state;
      return {
        ...base,
        removedIds: [...state.removedIds, command.id],
        selectedId: state.selectedId === command.id ? command.id : state.selectedId,
        check: null,
        checkHighlights: [],
        trace: null,
      };
    }
    case "RESTORE_COMPONENT":
      return {
        ...base,
        removedIds: state.removedIds.filter((id) => id !== command.id),
        check: null,
        checkHighlights: [],
        trace: null,
      };
    case "RESTORE_ALL":
      return { ...base, removedIds: [], check: null, checkHighlights: [], trace: null };
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
      const g = workingGraph(state);
      const results = evaluateRules(g, {
        jurisdictionId: g.jurisdictionId,
        projectDate: g.projectDate,
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
    case "SET_CHALLENGE": {
      const ch = challengeById(command.challengeId ?? state.challengeId);
      const routing = ch?.id === "challenge.cross.occupied-route";
      return {
        ...base,
        challengeActive: command.active,
        challengeId: ch?.id ?? state.challengeId,
        mode: command.active ? "break-it" : state.mode,
        selectedId: command.active ? (ch?.focusId ?? state.selectedId) : state.selectedId,
        explodeScope: command.active ? (ch?.targetAssembly ?? state.explodeScope) : state.explodeScope,
        xray: command.active ? true : state.xray,
        faultIds: command.active && routing ? [FAULT_MIDROOM] : command.active ? state.faultIds : [],
        hideFinish: command.active ? true : state.hideFinish,
      };
    }
    case "TOGGLE_DIAG":
      return { ...base, showDiag: !state.showDiag };
    case "TOGGLE_RECEIPT":
      return { ...base, showReceipt: !state.showReceipt, showRyanTest: false };
    case "TOGGLE_RYAN_TEST":
      return { ...base, showRyanTest: !state.showRyanTest, showReceipt: false };
    case "SET_TRADE_LAYER":
      return {
        ...base,
        tradeLayers: { ...state.tradeLayers, [command.trade]: command.state },
      };
    case "SET_FLOW_MODE":
      return { ...base, flowMode: command.mode };
    case "SET_HIDE_FINISH":
      return { ...base, hideFinish: command.enabled };
    case "TRACE_FROM": {
      if (!command.id) return { ...base, trace: null };
      const g = workingGraph(state);
      const c = g.components[command.id];
      if (!c) return { ...base, trace: null };
      const trade = tradeOf(c);
      const kind: TraceKind | null =
        trade === "plumbing" || trade === "electrical" || trade === "hvac" ? trade : null;
      if (!kind) {
        if ((c.tags ?? []).some((t) => t.endsWith("-control") || t.includes("control"))) {
          const tag =
            command.kinds?.[0] ??
            (c.tags ?? []).find((t) => t.endsWith("-control")) ??
            "air-control";
          const ids = Object.values(g.components)
            .filter((x) => (x.tags ?? []).includes(tag))
            .map((x) => x.id);
          return {
            ...base,
            selectedId: command.id,
            trace: { trade: "hvac", seedId: command.id, componentIds: ids, connectionIds: [] },
            flowMode: tag.startsWith("water")
              ? "control-water"
              : tag.startsWith("air")
                ? "control-air"
                : tag.startsWith("vapour")
                  ? "control-vapour"
                  : tag.startsWith("thermal")
                    ? "control-thermal"
                    : "control-layers",
          };
        }
        return { ...base, trace: null };
      }
      const walk = traceFromComponent(g, kind, command.id, state.removedIds, command.kinds);
      return {
        ...base,
        selectedId: command.id,
        trace: {
          trade: kind,
          seedId: command.id,
          componentIds: walk.componentIds,
          connectionIds: walk.connectionIds,
        },
      };
    }
    case "CLEAR_TRACE":
      return { ...base, trace: null };
    case "SET_VIEW_DEPTH":
      return { ...base, viewDepth: command.depth };
    case "SET_SEARCH": {
      const hits = searchComponents(workingGraph(state), command.query);
      return { ...base, searchQuery: command.query, searchHits: hits };
    }
    case "SHOW_ME": {
      const ids = command.ids.filter((id) => workingGraph(state).components[id]);
      if (ids.length === 0) return base;
      const first = ids[0]!;
      const group = workingGraph(state).components[first]?.assembly.explodeGroup ?? first;
      const iso = [group, ...descendants(workingGraph(state), group), ...ids];
      return {
        ...base,
        selectedId: first,
        isolatedIds: [...new Set(iso)],
        hideFinish: true,
        xray: true,
        cameraNonce: state.cameraNonce + 1,
        cameraCommand: "fit-selected",
        checkHighlights: ids,
      };
    }
    case "SET_FAULT": {
      const next = command.active
        ? state.faultIds.includes(command.faultId)
          ? state.faultIds
          : [...state.faultIds, command.faultId]
        : state.faultIds.filter((id) => id !== command.faultId);
      return { ...base, faultIds: next, check: null, checkHighlights: [] };
    }
    case "SET_LESSON":
      return { ...base, lessonId: command.id };
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
    a.isolatedIds === null &&
    a.trace === null &&
    a.hideFinish === false &&
    a.flowMode === "off" &&
    a.faultIds.length === 0 &&
    a.searchQuery === "" &&
    TRADE_LAYER_ON(a.tradeLayers)
  );
}

function TRADE_LAYER_ON(layers: Record<TradeId, TradeLayerState>): boolean {
  return Object.values(layers).every((s) => s === "on");
}

export { STAGE_MIN, STAGE_MAX };
