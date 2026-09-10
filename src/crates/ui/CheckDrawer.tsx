import { summarize } from "@/crates/rule-engine/engine";
import { useLab } from "@/crates/session/store";

export function CheckDrawer() {
  const check = useLab((s) => s.check);
  const dispatch = useLab((s) => s.dispatch);
  const graph = useLab((s) => s.graph);
  if (!check) return null;
  const counts = summarize(check);
  const issues = check.filter((r) => r.verdict !== "PASS");
  const headline =
    counts.FAIL > 0 ? "FAIL" : counts.MISSING_INFORMATION > 0 || counts.UNCERTAIN > 0 ? "INCOMPLETE" : "PASS";

  return (
    <section className="lab-check" aria-label="Build check">
      <header className="lab-check-head">
        <div>
          <p className="lab-kicker">Build check</p>
          <h2 className={`lab-check-verdict lab-check-${headline.toLowerCase()}`}>{headline}</h2>
        </div>
        <button type="button" className="lab-btn" onClick={() => dispatch({ type: "CLEAR_CHECK" })}>
          Close
        </button>
      </header>
      <p className="lab-muted">
        {counts.FAIL} fail · {counts.MISSING_INFORMATION} missing information · {counts.UNCERTAIN} uncertain · {counts.PASS} pass
      </p>
      <p className="lab-disclaimer">Not a permit determination.</p>
      <ul className="lab-check-list">
        {issues.map((r) => (
          <li key={r.ruleId} className="lab-check-item">
            <div className="lab-check-item-head">
              <span className={`lab-pill lab-pill-${r.verdict.toLowerCase().replace("_", "-")}`}>{r.verdict.replaceAll("_", " ")}</span>
              <strong>{r.title}</strong>
            </div>
            <p>{r.reason}</p>
            {r.assumption ? <p className="lab-muted">{r.assumption}</p> : null}
            <p className="lab-prov">{r.authorityLabel}</p>
            <p className="lab-mono">
              {r.ruleId} · pack {r.rulePackVersion} · {r.provenance.authority}
            </p>
            {r.componentIds.length ? (
              <p className="lab-muted">
                Affected: {r.componentIds.map((id) => graph.components[id]?.label ?? id).join(", ")}
              </p>
            ) : null}
            <div className="lab-inspect-actions">
              {r.componentIds[0] ? (
                <button
                  type="button"
                  className="lab-btn"
                  onClick={() => {
                    dispatch({ type: "SELECT_COMPONENT", id: r.componentIds[0]! });
                    dispatch({ type: "FIT_SELECTED" });
                  }}
                >
                  Show in 3D
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
