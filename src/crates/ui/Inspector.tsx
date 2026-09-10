import { authorityLabel, dimLines, parentLabel, stageName } from "@/crates/inspect/format";
import { descendants } from "@/crates/building-graph/integrity";
import { tradeOf } from "@/crates/trades/infer";
import { TRADE_LABELS } from "@/crates/trades/crate";
import { useLab } from "@/crates/session/store";

export function Inspector() {
  const graph = useLab((s) => s.graph);
  const selectedId = useLab((s) => s.selectedId);
  const mode = useLab((s) => s.mode);
  const removedIds = useLab((s) => s.removedIds);
  const dispatch = useLab((s) => s.dispatch);
  const explodeSelection = useLab((s) => s.explodeSelection);
  const isolateSelected = useLab((s) => s.isolateSelected);
  const isolatedIds = useLab((s) => s.isolatedIds);
  const trace = useLab((s) => s.trace);

  if (!selectedId) {
    return (
      <aside className="lab-inspector" aria-label="Inspector">
        <p className="lab-kicker">Inspect</p>
        <p className="lab-muted">Click a member in the house. The graph, not the mesh name, is the source of truth.</p>
      </aside>
    );
  }

  const c = graph.components[selectedId];
  if (!c) return null;
  const dims = dimLines(c);
  const removed = removedIds.includes(c.id);
  const supports = (c.structural?.supports ?? []).map((id) => graph.components[id]?.label ?? id);
  const supportedBy = (c.structural?.supportedBy ?? []).map((id) => graph.components[id]?.label ?? id);
  const trade = tradeOf(c);
  const sys = c.system?.systemId ? graph.systems.find((s) => s.id === c.system?.systemId) : undefined;
  const nodeId = c.system?.nodeId ?? c.id;
  const links =
    sys?.connections
      .filter((conn) => conn.from === nodeId || conn.to === nodeId)
      .map((conn) => {
        const other = conn.from === nodeId ? conn.to : conn.from;
        return `${conn.kind} → ${graph.components[other]?.label ?? other}`;
      }) ?? [];
  const conceals =
    c.type === "drywall" || c.type === "paint"
      ? "Conceals framing, insulation, and rough services until you x-ray, hide finish, or rewind time."
      : null;

  return (
    <aside className="lab-inspector" aria-label="Inspector">
      <p className="lab-kicker">
        {c.type.replace(/-/g, " ")} · {TRADE_LABELS[trade]}
      </p>
      <h2 className="lab-inspect-title">{c.label}</h2>
      {removed ? <p className="lab-pill lab-pill-fail">Removed</p> : null}
      <dl className="lab-dl">
        <div>
          <dt>Id</dt>
          <dd className="lab-mono">{c.id}</dd>
        </div>
        <div>
          <dt>Dimensions</dt>
          <dd>{dims.both}</dd>
        </div>
        <div>
          <dt>Material</dt>
          <dd>{c.material.label}</dd>
        </div>
        <div>
          <dt>Phase</dt>
          <dd>
            {c.assembly.stage} · {stageName(c.assembly.stage)}
          </dd>
        </div>
        <div>
          <dt>Assembly</dt>
          <dd>{parentLabel(graph, c)}</dd>
        </div>
        {c.structural?.loadPathRole ? (
          <div>
            <dt>Load path</dt>
            <dd>{c.structural.loadPathRole.replace(/-/g, " ")}</dd>
          </div>
        ) : null}
        {supportedBy.length ? (
          <div>
            <dt>Supported by</dt>
            <dd>{supportedBy.join(", ")}</dd>
          </div>
        ) : null}
        {supports.length ? (
          <div>
            <dt>Supports</dt>
            <dd>{supports.join(", ")}</dd>
          </div>
        ) : null}
        {c.system?.role ? (
          <div>
            <dt>System role</dt>
            <dd>
              {c.system.role} {sys ? `· ${sys.trade}` : ""}
            </dd>
          </div>
        ) : null}
        {links.length ? (
          <div>
            <dt>Connected to</dt>
            <dd>{links.slice(0, 6).join("; ")}</dd>
          </div>
        ) : null}
        {c.penetration ? (
          <div>
            <dt>Penetration</dt>
            <dd>
              {c.penetration.purpose} through {graph.components[c.penetration.hostId]?.label ?? c.penetration.hostId}
            </dd>
          </div>
        ) : null}
      </dl>
      <p className="lab-purpose">{c.learning.purpose}</p>
      <p className="lab-note">{c.learning.shortDescription}</p>
      {conceals ? <p className="lab-note">{conceals}</p> : null}
      {c.learning.visualization ? <p className="lab-viz-label">{c.learning.visualization}</p> : null}
      <p className="lab-prov">
        <span>{authorityLabel(c)}</span>
        <span className="lab-muted"> · {c.provenance.status}</span>
      </p>
      <div className="lab-inspect-actions">
        {c.system ? (
          <button
            type="button"
            className={trace?.seedId === c.id ? "lab-btn lab-btn-on" : "lab-btn"}
            onClick={() => dispatch({ type: "TRACE_FROM", id: c.id })}
          >
            Trace
          </button>
        ) : null}
        {trace ? (
          <button type="button" className="lab-btn" onClick={() => dispatch({ type: "CLEAR_TRACE" })}>
            Clear trace
          </button>
        ) : null}
        <button type="button" className="lab-btn" onClick={() => isolateSelected()}>
          {isolatedIds ? "Show context" : "Isolate"}
        </button>
        <button type="button" className="lab-btn" onClick={() => dispatch({ type: "HIDE_COMPONENT", id: c.id })}>
          Hide
        </button>
        <button type="button" className="lab-btn" onClick={() => explodeSelection()}>
          Explode assembly
        </button>
        <button type="button" className="lab-btn" onClick={() => dispatch({ type: "FIT_SELECTED" })}>
          Fit camera
        </button>
        {mode === "break-it" && c.geometry.kind === "box" ? (
          removed ? (
            <button type="button" className="lab-btn lab-btn-accent" onClick={() => dispatch({ type: "RESTORE_COMPONENT", id: c.id })}>
              Restore
            </button>
          ) : (
            <button type="button" className="lab-btn lab-btn-accent" onClick={() => dispatch({ type: "REMOVE_COMPONENT", id: c.id })}>
              Remove
            </button>
          )
        ) : null}
        <button
          type="button"
          className="lab-btn"
          onClick={() => {
            dispatch({ type: "ISOLATE", ids: null });
            dispatch({ type: "SHOW_COMPONENT", id: c.id });
            const kids = descendants(graph, c.assembly.explodeGroup);
            for (const id of kids) dispatch({ type: "SHOW_COMPONENT", id });
          }}
        >
          Reset view
        </button>
      </div>
    </aside>
  );
}
