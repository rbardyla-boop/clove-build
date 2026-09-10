import { liveReceipt } from "@/crates/test-receipts/receipt";
import { useLab } from "@/crates/session/store";

function fmtCounts(c: { passed: number; failed: number }) {
  return `${c.passed} passed / ${c.failed} failed`;
}

export function BuildReceipt() {
  const open = useLab((s) => s.showReceipt);
  const snapshot = useLab((s) => s);
  const dispatch = useLab((s) => s.dispatch);
  if (!open) return null;
  const r = liveReceipt(snapshot.graph, snapshot);
  const rows: [string, string][] = [
    ["Specimen", r.specimen],
    ["Version", r.version],
    ["Graph hash", r.graphHash],
    ["Components", String(r.componentCount)],
    ["Graph integrity", r.graphIntegrity],
    ["Explode invariant", r.explodeInvariant],
    ["Sequence invariant", r.sequenceInvariant],
    ["Reset invariant", r.resetInvariant],
    ["Rule determinism", r.ruleDeterminism],
    ["Clove core tests", fmtCounts(r.cloveCore)],
    ["Full repository tests", fmtCounts(r.fullRepository)],
    ["Typecheck", r.typecheck],
    ["Production build", r.productionBuild],
    ["GitHub CI", r.githubCi],
    ["Browser verification", r.browserVerification],
    ["Ryan human test", r.ryanHumanTest],
    ["Last run", r.automated.ranAt],
    ["Regulatory pack", r.regulatoryPack],
  ];
  return (
    <aside className="lab-drawer" aria-label="Build Receipt">
      <header className="lab-check-head">
        <div>
          <p className="lab-kicker">Build Receipt</p>
          <h2>Clove Build Lab</h2>
        </div>
        <button type="button" className="lab-btn" onClick={() => dispatch({ type: "TOGGLE_RECEIPT" })}>
          Close
        </button>
      </header>
      <dl className="lab-dl">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd className="lab-mono">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="lab-kicker">Known limitations</p>
      <ul className="lab-plain">
        {r.knownLimitations.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <p className="lab-disclaimer">
        This drawer does not certify itself. A green Clove subset does not mean the repository is green. A green
        repository does not mean the Ryan human test passed.
      </p>
    </aside>
  );
}
