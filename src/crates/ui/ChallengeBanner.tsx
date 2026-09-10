import { WINDOW_CHALLENGE } from "@/crates/break-it/challenge";
import { useLab } from "@/crates/session/store";

export function ChallengeBanner() {
  const active = useLab((s) => s.challengeActive);
  const check = useLab((s) => s.check);
  const dispatch = useLab((s) => s.dispatch);
  if (!active) return null;
  const opening = check?.find((r) => r.ruleId === "DEMO-OPENING-001");
  return (
    <div className="lab-challenge" role="region" aria-label="Break It challenge">
      <p className="lab-kicker">Break It</p>
      <h2>{WINDOW_CHALLENGE.title}</h2>
      <p>{WINDOW_CHALLENGE.prompt}</p>
      {opening ? (
        <p className="lab-note">
          {opening.verdict === "FAIL" ? opening.reason : WINDOW_CHALLENGE.hintAfterCheck}
        </p>
      ) : null}
      <div className="lab-inspect-actions">
        <button type="button" className="lab-btn lab-btn-accent" onClick={() => dispatch({ type: "RUN_CHECK" })}>
          Check my build
        </button>
        <button type="button" className="lab-btn" onClick={() => dispatch({ type: "RESTORE_ALL" })}>
          Try again
        </button>
        <button type="button" className="lab-btn" onClick={() => dispatch({ type: "SET_CHALLENGE", active: false })}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
