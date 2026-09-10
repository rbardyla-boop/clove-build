import type { ExplodeScope } from "@/crates/explode/engine";

export type LabMode = "inspect" | "break-it" | "build";

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
  | { type: "SET_CHALLENGE"; active: boolean }
  | { type: "TOGGLE_DIAG" }
  | { type: "TOGGLE_RECEIPT" }
  | { type: "TOGGLE_RYAN_TEST" };

export type LabEvent = Command & { at: number; seq: number };
