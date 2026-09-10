import type { ExplodeScope } from "@/crates/explode/engine";
import type { TradeId } from "@/crates/building-graph/types";
import type { TradeLayerState } from "@/crates/trades/infer";
import type { TraceKind } from "@/crates/system-graph/trace";

export type LabMode = "inspect" | "break-it" | "build";

export type FlowMode =
  | "off"
  | "supply"
  | "dwv"
  | "vent"
  | "energize"
  | "airflow-supply"
  | "airflow-return"
  | "airflow-exhaust"
  | "control-layers"
  | "control-water"
  | "control-air"
  | "control-vapour"
  | "control-thermal";

export type ViewDepth = "learn" | "technical";

export type TraceState = {
  trade: TraceKind;
  seedId: string;
  componentIds: string[];
  connectionIds: string[];
} | null;

export type Command =
  | { type: "SELECT_COMPONENT"; id: string | null }
  | { type: "SET_EXPLODE"; amount: number }
  | { type: "SET_EXPLODE_SCOPE"; scope: ExplodeScope }
  | { type: "SET_CONSTRUCTION_STAGE"; stage: number }
  | { type: "PLAY_SEQUENCE"; playing: boolean }
  | { type: "REMOVE_COMPONENT"; id: string }
  | { type: "RESTORE_COMPONENT"; id: string }
  | { type: "RESTORE_ALL" }
  | { type: "HIDE_COMPONENT"; id: string }
  | { type: "SHOW_COMPONENT"; id: string }
  | { type: "ISOLATE"; ids: string[] | null }
  | { type: "SET_MODE"; mode: LabMode }
  | { type: "SET_XRAY"; enabled: boolean }
  | { type: "SET_SECTION"; enabled: boolean; offset?: number }
  | { type: "RUN_CHECK" }
  | { type: "CLEAR_CHECK" }
  | { type: "RESET_SPECIMEN" }
  | { type: "RESET_CAMERA" }
  | { type: "FIT_SELECTED" }
  | { type: "FIT_HOUSE" }
  | { type: "SET_CHALLENGE"; active: boolean; challengeId?: string }
  | { type: "TOGGLE_DIAG" }
  | { type: "TOGGLE_RECEIPT" }
  | { type: "TOGGLE_RYAN_TEST" }
  | { type: "SET_TRADE_LAYER"; trade: TradeId; state: TradeLayerState }
  | { type: "SET_FLOW_MODE"; mode: FlowMode }
  | { type: "SET_HIDE_FINISH"; enabled: boolean }
  | { type: "TRACE_FROM"; id: string | null; kinds?: string[] }
  | { type: "CLEAR_TRACE" }
  | { type: "SET_VIEW_DEPTH"; depth: ViewDepth }
  | { type: "SET_SEARCH"; query: string }
  | { type: "SHOW_ME"; ids: string[]; reason?: "why" | "where" }
  | { type: "SET_FAULT"; faultId: string; active: boolean }
  | { type: "SET_LESSON"; id: string | null };

export type LabEvent = Command & { at: number; seq: number };
