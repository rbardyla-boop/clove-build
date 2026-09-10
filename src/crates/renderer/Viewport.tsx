import { useEffect, useRef } from "react";
import { useLab } from "@/crates/session/store";
import { HouseLab } from "./HouseLab";

export function Viewport() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labRef = useRef<HouseLab | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const state = useLab.getState();
    const lab = new HouseLab(canvas, state.graph, {
      onSelect: (id) => useLab.getState().dispatch({ type: "SELECT_COMPONENT", id }),
      onHover: () => {},
    });
    labRef.current = lab;
    lab.sync(state);
    const unsub = useLab.subscribe((s) => {
      lab.sync(s);
      if (s.cameraCommand) lab.handleCameraCommand(s.cameraCommand);
    });
    const onResize = () => lab.resize();
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const probe = () => {
      (window as unknown as { __clove: unknown }).__clove = {
        getState: () => {
          const s = useLab.getState();
          return {
            selectedId: s.selectedId,
            explodeAmount: s.explodeAmount,
            explodeScope: s.explodeScope,
            constructionStage: s.constructionStage,
            removedIds: s.removedIds,
            mode: s.mode,
            xray: s.xray,
            hideFinish: s.hideFinish,
            flowMode: s.flowMode,
            tradeLayers: s.tradeLayers,
            trace: s.trace,
            check: s.check?.map((r) => ({ ruleId: r.ruleId, verdict: r.verdict, domain: r.domain })),
            graphId: s.graph.id,
            componentCount: Object.keys(s.graph.components).length,
            systemCount: s.graph.systems.length,
            faultIds: s.faultIds,
            searchQuery: s.searchQuery,
            viewDepth: s.viewDepth,
          };
        },
        fps: lab.fps,
        drawCalls: lab.drawCalls,
        dispatch: (cmd: Parameters<typeof state.dispatch>[0]) => useLab.getState().dispatch(cmd),
        explodeSelection: () => useLab.getState().explodeSelection(),
      };
    };
    probe();
    const iv = window.setInterval(probe, 500);

    return () => {
      window.clearInterval(iv);
      unsub();
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      lab.dispose();
      labRef.current = null;
    };
  }, []);

  return (
    <div className="lab-stage" data-testid="lab-stage">
      <canvas ref={canvasRef} className="lab-canvas" aria-label="PEI demonstration house" />
    </div>
  );
}
