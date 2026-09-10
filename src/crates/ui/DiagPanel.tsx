import { useEffect, useState } from "react";
import { hashGraph } from "@/crates/building-graph/hash";
import { useLab } from "@/crates/session/store";

export function DiagPanel() {
  const open = useLab((s) => s.showDiag);
  const graph = useLab((s) => s.graph);
  const explodeAmount = useLab((s) => s.explodeAmount);
  const stage = useLab((s) => s.constructionStage);
  const removed = useLab((s) => s.removedIds.length);
  const [perf, setPerf] = useState({ fps: 0, drawCalls: 0 });

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => {
      const clove = (window as unknown as { __clove?: { fps: number; drawCalls: number } }).__clove;
      if (clove) setPerf({ fps: clove.fps, drawCalls: clove.drawCalls });
    }, 400);
    return () => window.clearInterval(id);
  }, [open]);

  if (!open) return null;
  return (
    <div className="lab-diag" aria-label="Diagnostics">
      <p className="lab-mono">
        fps {perf.fps.toFixed(0)} · calls {perf.drawCalls} · explode {explodeAmount.toFixed(2)} · stage {stage} · removed {removed}
      </p>
      <p className="lab-mono">hash {hashGraph(graph)}</p>
    </div>
  );
}
