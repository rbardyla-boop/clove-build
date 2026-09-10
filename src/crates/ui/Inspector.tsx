import { authorityLabel, dimLines, parentLabel, stageName } from "@/crates/inspect/format";
import { descendants } from "@/crates/building-graph/integrity";
import { tradeOf } from "@/crates/trades/infer";
import { TRADE_LABELS } from "@/crates/trades/crate";
import { classifyComponent } from "@/crates/space-model/classify";
import { classifyDwvRun } from "@/crates/geometry/run";
import { whyNotYet } from "@/crates/sequence/dag";
import { evaluateRelations } from "@/crates/relations/engine";
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
  const viewDepth = useLab((s) => s.viewDepth);
  const constructionStage = useLab((s) => s.constructionStage);

  if (!selectedId) {
    return (
      <aside className="lab-inspector" aria-label="Inspector">
        <p className="lab-kicker">Inspect</p>
        <p className="lab-muted">Click a member. The graph, not the mesh name, is the source of truth.</p>
        <div className="lab-inspect-actions">
          <button
            type="button"
            className={viewDepth === "learn" ? "lab-mini lab-mini-on" : "lab-mini"}
            onClick={() => dispatch({ type: "SET_VIEW_DEPTH", depth: "learn" })}
          >
            Learn
          </button>
          <button
            type="button"
            className={viewDepth === "technical" ? "lab-mini lab-mini-on" : "lab-mini"}
            onClick={() => dispatch({ type: "SET_VIEW_DEPTH", depth: "technical" })}
          >
            Technical
          </button>
        </div>
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
  const zone = classifyComponent(graph, c);
  const learn = viewDepth === "learn";
  const dwv = classifyDwvRun(c);
  const why = whyNotYet(graph, c.id, constructionStage, removedIds);
  const rels = evaluateRelations(graph).filter((r) =>
    graph.relations?.some((x) => x.id === r.relationId && (x.a === c.id || x.b === c.id)),
  );
  const atts = (graph.attachments ?? []).filter((a) => a.hostId === c.id || a.attachedId === c.id);

  return (
    <aside className="lab-inspector" aria-label="Inspector">
      <p className="lab-kicker">
        {c.type.replace(/-/g, " ")} · {TRADE_LABELS[trade]}
      </p>
      <h2 className="lab-inspect-title">{c.label}</h2>
      <div className="lab-inspect-actions">
        <button
          type="button"
          className={learn ? "lab-mini lab-mini-on" : "lab-mini"}
          onClick={() => dispatch({ type: "SET_VIEW_DEPTH", depth: "learn" })}
        >
          Learn
        </button>
        <button
          type="button"
          className={!learn ? "lab-mini lab-mini-on" : "lab-mini"}
          onClick={() => dispatch({ type: "SET_VIEW_DEPTH", depth: "technical" })}
        >
          Technical
        </button>
      </div>
      {removed ? <p className="lab-pill lab-pill-fail">Removed</p> : null}
      <dl className="lab-dl">
        {!learn ? (
          <div>
            <dt>Id</dt>
            <dd className="lab-mono">{c.id}</dd>
          </div>
        ) : null}
        <div>
          <dt>Dimensions</dt>
          <dd>{learn ? dims.metric : dims.both}</dd>
        </div>
        <div>
          <dt>Material</dt>
          <dd>{c.material.label}</dd>
        </div>
        <div>
          <dt>Space</dt>
          <dd>{zone.replaceAll("_", " ").toLowerCase()}</dd>
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
        {!learn && links.length ? (
          <div>
            <dt>Connected to</dt>
            <dd>{links.slice(0, 8).join("; ")}</dd>
          </div>
        ) : null}
        {c.penetration ? (
          <div>
            <dt>Penetration</dt>
            <dd>
              {c.penetration.purpose} through {graph.components[c.penetration.hostId]?.label ?? c.penetration.hostId}
              {c.penetration.diameter ? ` · ⌀${Math.round(c.penetration.diameter * 1000)} mm` : ""}
              {c.penetration.protectionState ? ` · protection ${c.penetration.protectionState}` : ""}
            </dd>
          </div>
        ) : null}
        {c.run ? (
          <div>
            <dt>Run</dt>
            <dd>
              from {c.run.from.map((n) => n.toFixed(2)).join(" ")} to {c.run.to.map((n) => n.toFixed(2)).join(" ")}
              {dwv.kind !== "not-dwv" ? ` · ${dwv.kind}` : ""}
              {c.run.designSlope != null ? ` · design slope ${c.run.designSlope} (${c.run.authorityClass ?? "PROJECT_MODEL_ASSUMPTION"})` : ""}
            </dd>
          </div>
        ) : null}
        {why.length ? (
          <div>
            <dt>Why not yet</dt>
            <dd>{why.join(" ")}</dd>
          </div>
        ) : null}
        {rels.length ? (
          <div>
            <dt>Relations</dt>
            <dd>{rels.map((r) => `${r.ok ? "ok" : "fail"}: ${r.reason}`).join("; ")}</dd>
          </div>
        ) : null}
        {atts.length ? (
          <div>
            <dt>Attachments</dt>
            <dd>{atts.map((a) => `${a.kind}${a.verified ? "" : " (unverified)"}`).join("; ")}</dd>
          </div>
        ) : null}
        {!learn ? (
          <div>
            <dt>Provenance</dt>
            <dd>
              {c.provenance.authority ?? "UNKNOWN"} · {c.provenance.status}
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
        {trade === "plumbing" ? (
          <>
            <button type="button" className="lab-btn" onClick={() => dispatch({ type: "TRACE_FROM", id: c.id, kinds: ["cold", "hot"] })}>
              Trace supply
            </button>
            <button type="button" className="lab-btn" onClick={() => dispatch({ type: "TRACE_FROM", id: c.id, kinds: ["drain"] })}>
              Trace drain
            </button>
            <button type="button" className="lab-btn" onClick={() => dispatch({ type: "TRACE_FROM", id: c.id, kinds: ["vent"] })}>
              Trace vent
            </button>
          </>
        ) : null}
        {trade === "electrical" ? (
          <button type="button" className="lab-btn" onClick={() => dispatch({ type: "TRACE_FROM", id: c.id, kinds: ["circuit", "bonding"] })}>
            Trace to panel
          </button>
        ) : null}
        {trade === "hvac" ? (
          <>
            <button type="button" className="lab-btn" onClick={() => dispatch({ type: "TRACE_FROM", id: c.id, kinds: ["air-supply"] })}>
              Trace supply
            </button>
            <button type="button" className="lab-btn" onClick={() => dispatch({ type: "TRACE_FROM", id: c.id, kinds: ["air-return"] })}>
              Trace return
            </button>
            <button type="button" className="lab-btn" onClick={() => dispatch({ type: "TRACE_FROM", id: c.id, kinds: ["exhaust"] })}>
              Trace exhaust
            </button>
          </>
        ) : null}
        {c.system && trade !== "plumbing" && trade !== "electrical" && trade !== "hvac" ? (
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
          Show me where
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
