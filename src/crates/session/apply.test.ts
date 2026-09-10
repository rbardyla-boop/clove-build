import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { applyCommand, createSnapshot } from "./apply.ts";
import { STAGE_MAX } from "../construction-sequence/stages.ts";

describe("mutations and reset", () => {
  const graph = buildPeiHouse();
  const header = Object.values(graph.components).find((c) => c.type === "header")!;

  it("remove changes graph overlay state", () => {
    let s = createSnapshot(graph);
    s = applyCommand(s, { type: "SET_MODE", mode: "break-it" });
    s = applyCommand(s, { type: "REMOVE_COMPONENT", id: header.id });
    assert.deepEqual(s.removedIds, [header.id]);
  });

  it("restore reverses a removal", () => {
    let s = createSnapshot(graph);
    s = applyCommand(s, { type: "SET_MODE", mode: "break-it" });
    s = applyCommand(s, { type: "REMOVE_COMPONENT", id: header.id });
    s = applyCommand(s, { type: "RESTORE_COMPONENT", id: header.id });
    assert.deepEqual(s.removedIds, []);
  });

  it("restore-all equals baseline overlay", () => {
    let s = createSnapshot(graph);
    s = applyCommand(s, { type: "SET_MODE", mode: "break-it" });
    s = applyCommand(s, { type: "REMOVE_COMPONENT", id: header.id });
    const joist = Object.values(graph.components).find((c) => c.type === "floor-joist")!;
    s = applyCommand(s, { type: "REMOVE_COMPONENT", id: joist.id });
    s = applyCommand(s, { type: "RESTORE_ALL" });
    const base = createSnapshot(graph);
    assert.deepEqual(s.removedIds, base.removedIds);
  });

  it("reset restores canonical specimen overlay", () => {
    let s = createSnapshot(graph);
    s = applyCommand(s, { type: "SET_MODE", mode: "break-it" });
    s = applyCommand(s, { type: "REMOVE_COMPONENT", id: header.id });
    s = applyCommand(s, { type: "SET_EXPLODE", amount: 0.8 });
    s = applyCommand(s, { type: "SET_CONSTRUCTION_STAGE", stage: 4 });
    s = applyCommand(s, { type: "RESET_SPECIMEN" });
    assert.deepEqual(s.removedIds, []);
    assert.equal(s.explodeAmount, 0);
    assert.equal(s.constructionStage, STAGE_MAX);
    assert.equal(s.selectedId, null);
  });

  it("invalid remove in inspect mode is ignored", () => {
    let s = createSnapshot(graph);
    s = applyCommand(s, { type: "REMOVE_COMPONENT", id: header.id });
    assert.deepEqual(s.removedIds, []);
  });
});
