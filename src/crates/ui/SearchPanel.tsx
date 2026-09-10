import { useLab } from "@/crates/session/store";

export function SearchPanel() {
  const query = useLab((s) => s.searchQuery);
  const hits = useLab((s) => s.searchHits);
  const dispatch = useLab((s) => s.dispatch);

  return (
    <div className="lab-search" role="search">
      <label className="sr-only" htmlFor="clove-search">
        Search the house
      </label>
      <input
        id="clove-search"
        type="search"
        placeholder="header, kitchen drain, main panel…"
        value={query}
        aria-label="Search the semantic graph"
        onChange={(e) => dispatch({ type: "SET_SEARCH", query: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === "Enter" && hits[0]) {
            dispatch({ type: "SHOW_ME", ids: [hits[0].id], reason: "where" });
          }
        }}
      />
      {query.length >= 2 ? (
        <ul className="lab-search-hits">
          {hits.length === 0 ? <li className="lab-muted">No semantic matches</li> : null}
          {hits.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                className="lab-search-hit"
                onClick={() => dispatch({ type: "SHOW_ME", ids: [h.id], reason: "where" })}
              >
                <strong>{h.label}</strong>
                <span className="lab-muted">{h.reason}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
