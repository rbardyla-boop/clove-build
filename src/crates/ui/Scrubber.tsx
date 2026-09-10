import { CONSTRUCTION_STAGES, STAGE_MAX, STAGE_MIN } from "@/crates/construction-sequence/stages";
import { useLab } from "@/crates/session/store";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";

export function Scrubber() {
  const stage = useLab((s) => s.constructionStage);
  const playing = useLab((s) => s.playing);
  const dispatch = useLab((s) => s.dispatch);
  const current = CONSTRUCTION_STAGES.find((s) => s.id === stage);

  return (
    <div className="lab-scrubber" aria-label="Construction sequence">
      <button
        type="button"
        className="lab-icon-btn"
        aria-label="Previous stage"
        onClick={() => {
          dispatch({ type: "PLAY_SEQUENCE", playing: false });
          dispatch({ type: "SET_CONSTRUCTION_STAGE", stage: stage - 1 });
        }}
      >
        <SkipBack size={14} />
      </button>
      <button
        type="button"
        className="lab-icon-btn"
        aria-label={playing ? "Pause" : "Play construction"}
        onClick={() => dispatch({ type: "PLAY_SEQUENCE", playing: !playing })}
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <button
        type="button"
        className="lab-icon-btn"
        aria-label="Next stage"
        onClick={() => {
          dispatch({ type: "PLAY_SEQUENCE", playing: false });
          dispatch({ type: "SET_CONSTRUCTION_STAGE", stage: stage + 1 });
        }}
      >
        <SkipForward size={14} />
      </button>
      <span className="lab-scrubber-label">
        <span className="lab-kicker">Construction</span>
        {current?.label}
      </span>
      <input
        type="range"
        min={STAGE_MIN}
        max={STAGE_MAX}
        step={1}
        value={stage}
        aria-valuetext={current?.label}
        aria-label="Construction stage"
        className="lab-range"
        onChange={(e) => {
          dispatch({ type: "PLAY_SEQUENCE", playing: false });
          dispatch({ type: "SET_CONSTRUCTION_STAGE", stage: Number(e.target.value) });
        }}
      />
      <span className="lab-range-ends" aria-hidden="true">
        <span>Foundation</span>
        <span>Complete</span>
      </span>
    </div>
  );
}
