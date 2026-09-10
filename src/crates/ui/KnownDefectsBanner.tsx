import { findKnownDefects } from "@/crates/known-failures/detectors";
import { openFailuresFor } from "@/crates/known-failures/registry";
import { useLab } from "@/crates/session/store";

export function KnownDefectsBanner() {
  const graph = useLab((s) => s.graph);
  const dispatch = useLab((s) => s.dispatch);
  const open = openFailuresFor(graph.id);
  if (!open.length) return null;
  const hits = findKnownDefects(graph);
  return (
    <aside className="lab-known" aria-label="Known defects in this experimental build">
      <p className="lab-kicker">v0.3 experimental · known defects</p>
      <p className="lab-muted">
        Already recorded. Do not re-report these as new feedback. Geometry is not being patched this week.
      </p>
      <ul>
        {open.map((f) => {
          const n = hits.filter((h) => h.failureId === f.id).length;
          return (
            <li key={f.id}>
              <button
                type="button"
                className="lab-known-link"
                onClick={() => {
                  const hit = hits.find((h) => h.failureId === f.id);
                  if (hit) dispatch({ type: "SELECT_COMPONENT", id: hit.b });
                }}
              >
                <strong>{f.id}</strong>
                <span>
                  {f.title}
                  {n ? ` · ${n} hit${n === 1 ? "" : "s"}` : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
