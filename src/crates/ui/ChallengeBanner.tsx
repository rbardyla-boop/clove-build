import { challengeById } from "@/crates/trades/challenges";
import { useLab } from "@/crates/session/store";

export function ChallengeBanner() {
  const active = useLab((s) => s.challengeActive);
  const challengeId = useLab((s) => s.challengeId);
  const check = useLab((s) => s.check);
  const dispatch = useLab((s) => s.dispatch);
  if (!active) return null;
  const ch = challengeById(challengeId);
  if (!ch) return null;
  const hintRule = ch.checkHintRuleId ? check?.find((r) => r.ruleId === ch.checkHintRuleId) : undefined;
  return (
    <div className="lab-challenge" role="region" aria-label="Break It challenge">
      <p className="lab-kicker">Break It · {ch.trade}</p>
      <h2>{ch.title}</h2>
      <p>{ch.prompt}</p>
      {hintRule ? (
        <p className="lab-note">{hintRule.verdict === "FAIL" ? hintRule.reason : ch.hintAfterCheck}</p>
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
