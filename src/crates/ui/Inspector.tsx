import { authorityLabel, dimLines, parentLabel, stageName } from "@/crates/inspect/format";
import { descendants } from "@/crates/building-graph/integrity";
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

  return (
    <aside className="lab-inspector" aria-label="Inspector">
      <p className="lab-kicker">{c.type.replace(/-/g, " ")}</p>
      <h2 className="lab-inspect-title">{c.label}</h2>
      {removed ? <p className="lab-pill lab-pill-fail">Removed</p> : null}
      <dl className="lab-dl">
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
      </dl>
      <p className="lab-purpose">{c.learning.purpose}</p>
      <p className="lab-note">{c.learning.shortDescription}</p>
      <p className="lab-prov">
        <span>{authorityLabel(c)}</span>
        <span className="lab-muted"> · {c.provenance.status}</span>
      </p>
      <div className="lab-inspect-actions">
        <button type="button" className="lab-btn" onClick={() => isolateSelected()}>
          {isolatedIds ? "Show context" : "Isolate"}
        </button>
        <button
          type="button"
          className="lab-btn"
          onClick={() =>
            dispatch({
              type: "HIDE_COMPONENT",
              id: c.id,
            })
          }
        >
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
