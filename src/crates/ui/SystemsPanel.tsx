import { TRADE_IDS, type TradeLayerState } from "@/crates/trades/infer";
import { TRADE_LABELS } from "@/crates/trades/crate";
import { useLab } from "@/crates/session/store";
import type { FlowMode } from "@/crates/session/commands";
import type { TradeId } from "@/crates/building-graph/types";

const LAYERS: TradeLayerState[] = ["on", "ghost", "off"];

const FLOWS: { id: FlowMode; label: string }[] = [
  { id: "off", label: "Normal" },
  { id: "supply", label: "Supply" },
  { id: "dwv", label: "Drain" },
  { id: "vent", label: "Vent" },
  { id: "energize", label: "Energize" },
  { id: "airflow-supply", label: "Supply air" },
  { id: "airflow-return", label: "Return" },
  { id: "airflow-exhaust", label: "Exhaust" },
  { id: "control-layers", label: "All control" },
  { id: "control-water", label: "Water" },
  { id: "control-air", label: "Air" },
  { id: "control-vapour", label: "Vapour" },
  { id: "control-thermal", label: "Thermal" },
];

export function SystemsPanel() {
  const layers = useLab((s) => s.tradeLayers);
  const flowMode = useLab((s) => s.flowMode);
  const hideFinish = useLab((s) => s.hideFinish);
  const dispatch = useLab((s) => s.dispatch);

  return (
    <aside className="lab-systems" aria-label="Systems">
      <p className="lab-kicker">Systems</p>
      <ul className="lab-systems-list">
        {TRADE_IDS.map((trade) => (
          <li key={trade} className="lab-systems-row">
            <span>{TRADE_LABELS[trade]}</span>
            <span className="lab-systems-toggles">
              {LAYERS.map((st) => (
                <button
                  key={st}
                  type="button"
                  className={layers[trade] === st ? "lab-mini lab-mini-on" : "lab-mini"}
                  onClick={() => dispatch({ type: "SET_TRADE_LAYER", trade: trade as TradeId, state: st })}
                >
                  {st}
                </button>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <div className="lab-systems-flow">
        {FLOWS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={flowMode === f.id ? "lab-mini lab-mini-on" : "lab-mini"}
            onClick={() => dispatch({ type: "SET_FLOW_MODE", mode: f.id })}
          >
            {f.label}
          </button>
        ))}
      </div>
      <p className="lab-viz-label">
        {flowMode === "off"
          ? "Beauty first. Diagnostic colour only when you ask."
          : flowMode === "energize"
            ? "TOPOLOGY / STATE VISUALIZATION — not electromagnetic simulation."
            : flowMode === "control-layers"
              ? "BUILDING-SCIENCE VISUALIZATION — water, air, vapour, thermal."
              : flowMode.startsWith("airflow")
                ? "SCHEMATIC AIRFLOW — not CFD."
                : "SCHEMATIC FLOW — not hydraulic simulation."}
      </p>
      <button
        type="button"
        className={hideFinish ? "lab-btn lab-btn-on" : "lab-btn"}
        onClick={() => dispatch({ type: "SET_HIDE_FINISH", enabled: !hideFinish })}
      >
        Hide finish
      </button>
    </aside>
  );
}
