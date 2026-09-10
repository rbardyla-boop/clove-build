import { selectJurisdiction } from "@/crates/jurisdiction/select";
import { SPECIMENS } from "@/specimen/catalog";
import { useLab } from "@/crates/session/store";
import { SearchPanel } from "./SearchPanel";

export function TopBar() {
  const graph = useLab((s) => s.graph);
  const dispatch = useLab((s) => s.dispatch);
  const pack = selectJurisdiction(graph.jurisdictionId, graph.projectDate);
  const nbc = pack.adoptedCodeEditions.find((e) => e.family === "NBC");
  const specimen = SPECIMENS.find((s) => s.id === graph.id);

  return (
    <header className="lab-top">
      <div className="lab-brand">
        <span className="lab-wordmark">Clove</span>
        <span className="lab-product">Build Lab</span>
      </div>
      <label className="lab-specimen">
        <span className="lab-sr">Specimen</span>
        <select
          className="lab-select"
          value={graph.id}
          onChange={(e) => dispatch({ type: "LOAD_SPECIMEN", id: e.target.value })}
          aria-label="Choose dwelling"
        >
          {SPECIMENS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </label>
      <div className="lab-context" title={pack.regulatoryStatus}>
        <span>Prince Edward Island</span>
        <span className="lab-dot" aria-hidden="true" />
        <span>{specimen?.constructionType ?? "house"}</span>
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
