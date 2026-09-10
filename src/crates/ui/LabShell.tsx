import { useEffect, useState, type ComponentType } from "react";
import { STAGE_MAX, STAGE_MIN } from "@/crates/construction-sequence/stages";
import { useLab } from "@/crates/session/store";
import { BuildReceipt } from "./BuildReceipt";
import { ChallengeBanner } from "./ChallengeBanner";
import { CheckDrawer } from "./CheckDrawer";
import { DiagPanel } from "./DiagPanel";
import { Hint } from "./Hint";
import { Inspector } from "./Inspector";
import { LearnPanel } from "./LearnPanel";
import { RyanTest } from "./RyanTest";
import { Scrubber } from "./Scrubber";
import { SystemsPanel } from "./SystemsPanel";
import { Toolbar } from "./Toolbar";
import { TopBar } from "./TopBar";

export function LabShell() {
  const [Viewport, setViewport] = useState<ComponentType | null>(null);
  const playing = useLab((s) => s.playing);
  const stage = useLab((s) => s.constructionStage);
  const dispatch = useLab((s) => s.dispatch);
  const mode = useLab((s) => s.mode);
  const selectedId = useLab((s) => s.selectedId);

  useEffect(() => {
    void import("@/crates/renderer/Viewport").then((m) => setViewport(() => m.Viewport));
  }, []);

  useEffect(() => {
    if (!playing) return;
    let acc = 0;
    let last = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      acc += dt;
      if (acc >= 0.8) {
        acc = 0;
        const s = useLab.getState();
        if (s.constructionStage >= STAGE_MAX) {
          s.dispatch({ type: "PLAY_SEQUENCE", playing: false });
          return;
        }
        s.dispatch({ type: "SET_CONSTRUCTION_STAGE", stage: s.constructionStage + 1 });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        document.getElementById("clove-search")?.focus();
      } else if (e.key === "Escape") {
        dispatch({ type: "SELECT_COMPONENT", id: null });
        dispatch({ type: "CLEAR_CHECK" });
      } else if (e.key === "ArrowRight") {
        dispatch({ type: "PLAY_SEQUENCE", playing: false });
        dispatch({ type: "SET_CONSTRUCTION_STAGE", stage: Math.min(STAGE_MAX, stage + 1) });
      } else if (e.key === "ArrowLeft") {
        dispatch({ type: "PLAY_SEQUENCE", playing: false });
        dispatch({ type: "SET_CONSTRUCTION_STAGE", stage: Math.max(STAGE_MIN, stage - 1) });
      } else if (e.key === "x" || e.key === "X") {
        dispatch({ type: "SET_XRAY", enabled: !useLab.getState().xray });
      } else if (e.key === "e" || e.key === "E") {
        useLab.getState().explodeSelection();
      } else if (e.key === " ") {
        e.preventDefault();
        dispatch({ type: "PLAY_SEQUENCE", playing: !useLab.getState().playing });
      } else if ((e.key === "Backspace" || e.key === "Delete") && mode === "break-it" && selectedId) {
        e.preventDefault();
        dispatch({ type: "REMOVE_COMPONENT", id: selectedId });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, mode, selectedId, stage]);

  return (
    <div className="lab-root">
      <TopBar />
      <div className="lab-main">
        {Viewport ? <Viewport /> : <div className="lab-stage lab-stage-boot">Loading laboratory…</div>}
        <SystemsPanel />
        <Inspector />
        <LearnPanel />
        <Hint />
        <ChallengeBanner />
        <CheckDrawer />
        <RyanTest />
        <BuildReceipt />
        <DiagPanel />
      </div>
      <Scrubber />
      <Toolbar />
    </div>
  );
}
