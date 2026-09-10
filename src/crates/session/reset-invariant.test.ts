import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { hashGraph } from "../building-graph/hash.ts";
import { applyCommand, createSnapshot, type LabSnapshot } from "./apply.ts";
import { STAGE_MAX } from "../construction-sequence/stages.ts";

function overlay(s: LabSnapshot) {
  return {
    selectedId: s.selectedId,
    explodeAmount: s.explodeAmount,
    explodeScope: s.explodeScope,
    constructionStage: s.constructionStage,
    removedIds: s.removedIds,
    hiddenIds: s.hiddenIds,
    isolatedIds: s.isolatedIds,
    mode: s.mode,
    xray: s.xray,
    sectionEnabled: s.sectionEnabled,
    check: s.check,
    checkHighlights: s.checkHighlights,
    challengeActive: s.challengeActive,
    tradeLayers: s.tradeLayers,
    flowMode: s.flowMode,
    hideFinish: s.hideFinish,
    trace: s.trace,
  };
}

describe("reset invariant", () => {
  const graph = buildPeiHouse();
  const baselineHash = hashGraph(graph);

  it("returns overlay and graph hash to baseline after a messy sequence", () => {
    let s = createSnapshot(graph);
    const base = overlay(s);
    s = applyCommand(s, { type: "SET_EXPLODE", amount: 1 });
    s = applyCommand(s, { type: "SET_EXPLODE_SCOPE", scope: "assembly.wall.bath" });
    s = applyCommand(s, { type: "SET_TRADE_LAYER", trade: "finish", state: "off" });
    s = applyCommand(s, { type: "SET_TRADE_LAYER", trade: "envelope", state: "ghost" });
    s = applyCommand(s, { type: "TRACE_FROM", id: "electrical.device.receptacle.front.001" });
    s = applyCommand(s, { type: "SET_MODE", mode: "break-it" });
    s = applyCommand(s, { type: "REMOVE_COMPONENT", id: "plumbing.dwv.trap.lav.001" });
    s = applyCommand(s, { type: "REMOVE_COMPONENT", id: "assembly.wall.front.jack.W1.L" });
    s = applyCommand(s, { type: "SET_CONSTRUCTION_STAGE", stage: 8 });
    s = applyCommand(s, { type: "SET_XRAY", enabled: true });
    s = applyCommand(s, { type: "SET_HIDE_FINISH", enabled: true });
    s = applyCommand(s, { type: "RUN_CHECK" });
    s = applyCommand(s, { type: "RESTORE_COMPONENT", id: "plumbing.dwv.trap.lav.001" });
    s = applyCommand(s, { type: "RESET_SPECIMEN" });
    assert.deepEqual(overlay(s), base);
    assert.equal(s.constructionStage, STAGE_MAX);
    assert.equal(hashGraph(s.graph), baselineHash);
    assert.equal(s.graph, graph);
  });
});
