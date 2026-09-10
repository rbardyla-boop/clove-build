import { useLab } from "@/crates/session/store";
import { TRADE_CHALLENGES } from "@/crates/trades/challenges";
import { TRADE_IDS } from "@/crates/trades/infer";
import { TRADE_LABELS } from "@/crates/trades/crate";
import type { TradeId } from "@/crates/building-graph/types";

export function Toolbar() {
  const mode = useLab((s) => s.mode);
  const explodeAmount = useLab((s) => s.explodeAmount);
  const explodeScope = useLab((s) => s.explodeScope);
  const xray = useLab((s) => s.xray);
  const sectionEnabled = useLab((s) => s.sectionEnabled);
  const sectionOffset = useLab((s) => s.sectionOffset);
  const challengeActive = useLab((s) => s.challengeActive);
  const challengeId = useLab((s) => s.challengeId);
  const selectedId = useLab((s) => s.selectedId);
  const graph = useLab((s) => s.graph);
  const dispatch = useLab((s) => s.dispatch);
  const explodeSelection = useLab((s) => s.explodeSelection);

  return (
    <div className="lab-toolbar" role="toolbar" aria-label="Laboratory controls">
      <label className="lab-explode">
        <span>Amount</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(explodeAmount * 100)}
          aria-label="Explode amount"
          className="lab-range lab-range-explode"
          onChange={(e) => dispatch({ type: "SET_EXPLODE", amount: Number(e.target.value) / 100 })}
        />
        <span className="lab-tabular">{Math.round(explodeAmount * 100)}%</span>
      </label>
      <button type="button" className="lab-btn" onClick={() => explodeSelection()}>
        {explodeAmount > 0.04 ? "Collapse" : "Explode"}
      </button>
      <button
        type="button"
        className={explodeScope === "whole" ? "lab-btn lab-btn-on" : "lab-btn"}
        onClick={() => dispatch({ type: "SET_EXPLODE_SCOPE", scope: "whole" })}
      >
        Whole house
      </button>
      <select
        className="lab-select"
        aria-label="Trade explode"
        value={typeof explodeScope === "string" && explodeScope.startsWith("trade:") ? explodeScope : ""}
        onChange={(e) => {
          if (!e.target.value) return;
          dispatch({ type: "SET_EXPLODE_SCOPE", scope: e.target.value });
          dispatch({ type: "SET_EXPLODE", amount: 1 });
        }}
      >
        <option value="">Trade explode…</option>
        {TRADE_IDS.map((t) => (
          <option key={t} value={`trade:${t}`}>
            {TRADE_LABELS[t as TradeId]}
          </option>
        ))}
      </select>
      <button
        type="button"
        className={mode === "inspect" ? "lab-btn lab-btn-on" : "lab-btn"}
        onClick={() => dispatch({ type: "SET_MODE", mode: "inspect" })}
      >
        Inspect
      </button>
      <button
        type="button"
        className={mode === "break-it" ? "lab-btn lab-btn-on" : "lab-btn"}
        onClick={() => dispatch({ type: "SET_MODE", mode: "break-it" })}
      >
        Break It
      </button>
      <button type="button" className="lab-btn lab-btn-accent" onClick={() => dispatch({ type: "RUN_CHECK" })}>
        Check
      </button>
      <button type="button" className="lab-btn" onClick={() => dispatch({ type: "RESET_SPECIMEN" })}>
        Reset
      </button>
      <button type="button" className={xray ? "lab-btn lab-btn-on" : "lab-btn"} onClick={() => dispatch({ type: "SET_XRAY", enabled: !xray })}>
        X-ray
      </button>
      <button
        type="button"
        className={sectionEnabled ? "lab-btn lab-btn-on" : "lab-btn"}
        onClick={() => dispatch({ type: "SET_SECTION", enabled: !sectionEnabled })}
      >
        Section
      </button>
      {sectionEnabled ? (
        <label className="lab-explode">
          <span className="sr-only">Section plane</span>
          <input
            type="range"
            min={-4}
            max={4}
            step={0.05}
            value={sectionOffset}
            aria-label="Section plane offset"
            className="lab-range lab-range-explode"
            onChange={(e) => dispatch({ type: "SET_SECTION", enabled: true, offset: Number(e.target.value) })}
          />
        </label>
      ) : null}
      <select
        className="lab-select"
        aria-label="Break It challenge"
        value={challengeActive ? challengeId : ""}
        onChange={(e) => {
          if (!e.target.value) {
            dispatch({ type: "SET_CHALLENGE", active: false });
            return;
          }
          dispatch({ type: "SET_CHALLENGE", active: true, challengeId: e.target.value });
        }}
      >
        <option value="">Challenge…</option>
        {TRADE_CHALLENGES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
      {selectedId && graph.components[selectedId]?.system ? (
        <button type="button" className="lab-btn" onClick={() => dispatch({ type: "TRACE_FROM", id: selectedId })}>
          Trace
        </button>
      ) : null}
    </div>
  );
}
