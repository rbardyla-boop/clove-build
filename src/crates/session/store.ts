import { create } from "zustand";
import { descendants } from "@/crates/building-graph/integrity";
import { buildPeiHouse } from "@/specimen/pei-part9-house";
import { applyCommand, createSnapshot, type LabSnapshot } from "./apply";
import type { Command } from "./commands";
import type { ExplodeScope } from "@/crates/explode/engine";

export type LabStore = LabSnapshot & {
  dispatch: (command: Command) => void;
  explodeSelection: () => void;
  isolateSelected: () => void;
};

const baseline = buildPeiHouse();

export const useLab = create<LabStore>((set, get) => ({
  ...createSnapshot(baseline),
  dispatch: (command) => {
    set((state) => applyCommand(state, command));
  },
  explodeSelection: () => {
    const s = get();
    if (s.explodeAmount > 0.04) {
      s.dispatch({ type: "SET_EXPLODE", amount: 0 });
      return;
    }
    let scope: ExplodeScope = "whole";
    if (s.selectedId) {
      const c = s.graph.components[s.selectedId];
      scope = c?.assembly.explodeGroup ?? "whole";
    }
    s.dispatch({ type: "SET_EXPLODE_SCOPE", scope });
    s.dispatch({ type: "SET_EXPLODE", amount: 1 });
  },
  isolateSelected: () => {
    const s = get();
    if (!s.selectedId) {
      s.dispatch({ type: "ISOLATE", ids: null });
      return;
    }
    if (s.isolatedIds) {
      s.dispatch({ type: "ISOLATE", ids: null });
      return;
    }
    const c = s.graph.components[s.selectedId];
    const assembly = c?.assembly.explodeGroup ?? s.selectedId;
    const ids = [assembly, ...descendants(s.graph, assembly)];
    s.dispatch({ type: "ISOLATE", ids });
  },
}));

export function getLabState(): LabSnapshot {
  return useLab.getState();
}
