import { selectJurisdiction } from "@/crates/jurisdiction/select";
import { useLab } from "@/crates/session/store";
import { SearchPanel } from "./SearchPanel";

export function TopBar() {
  const graph = useLab((s) => s.graph);
  const dispatch = useLab((s) => s.dispatch);
  const pack = selectJurisdiction(graph.jurisdictionId, graph.projectDate);
  const nbc = pack.adoptedCodeEditions.find((e) => e.family === "NBC");

  return (
    <header className="lab-top">
      <div className="lab-brand">
        <span className="lab-wordmark">Clove</span>
        <span className="lab-product">Build Lab</span>
      </div>
      <div className="lab-context" title={pack.regulatoryStatus}>
        <span>Prince Edward Island</span>
        <span className="lab-dot" aria-hidden="true" />
        <span>Detached house</span>
        <span className="lab-dot" aria-hidden="true" />
        <span>{nbc ? `NBC ${nbc.edition}` : pack.codeFamilyLabel}</span>
      </div>
      <SearchPanel />
      <div className="lab-top-actions">
        <button type="button" className="lab-btn" onClick={() => dispatch({ type: "FIT_HOUSE" })}>
          Fit
        </button>
        <button type="button" className="lab-btn" onClick={() => dispatch({ type: "TOGGLE_RYAN_TEST" })}>
          Ryan Test
        </button>
        <button type="button" className="lab-btn" onClick={() => dispatch({ type: "TOGGLE_RECEIPT" })}>
          Receipt
        </button>
        <button type="button" className="lab-btn" onClick={() => dispatch({ type: "TOGGLE_DIAG" })} aria-label="Diagnostics">
          Diag
        </button>
      </div>
    </header>
  );
}
