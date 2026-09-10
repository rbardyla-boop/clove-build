import { LESSONS } from "@/crates/learn/lessons";
import { useLab } from "@/crates/session/store";

export function LearnPanel() {
  const lessonId = useLab((s) => s.lessonId);
  const dispatch = useLab((s) => s.dispatch);
  const lesson = LESSONS.find((l) => l.id === lessonId) ?? null;
  if (!lesson) {
    return (
      <aside className="lab-learn" aria-label="Learn">
        <p className="lab-kicker">Predict → touch → observe</p>
        <ul className="lab-learn-list">
          {LESSONS.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                className="lab-search-hit"
                onClick={() => {
                  dispatch({ type: "SET_LESSON", id: l.id });
                  dispatch({ type: "SELECT_COMPONENT", id: l.seedId });
                  dispatch({ type: "FIT_SELECTED" });
                }}
              >
                {l.prompt}
              </button>
            </li>
          ))}
        </ul>
      </aside>
    );
  }
  return (
    <aside className="lab-learn" aria-label="Learn">
      <p className="lab-kicker">Lesson</p>
      <h2>{lesson.prompt}</h2>
      <p>{lesson.hint}</p>
      <p className="lab-note">{lesson.observe}</p>
      <div className="lab-inspect-actions">
        <button
          type="button"
          className="lab-btn lab-btn-accent"
          onClick={() => {
            dispatch({ type: "SELECT_COMPONENT", id: lesson.seedId });
            dispatch({ type: "TRACE_FROM", id: lesson.seedId });
            dispatch({ type: "FIT_SELECTED" });
          }}
        >
          Touch
        </button>
        <button type="button" className="lab-btn" onClick={() => dispatch({ type: "SET_LESSON", id: null })}>
          Close
        </button>
      </div>
    </aside>
  );
}
