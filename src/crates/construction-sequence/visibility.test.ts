import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { STAGE_MAX, STAGE_MIN } from "./stages.ts";
import { isStageVisible, visibleIds } from "./visibility.ts";

describe("construction sequence", () => {
  const graph = buildPeiHouse();
  const none = new Set<string>();

  it("stage visibility comes from component metadata", () => {
    const early = visibleIds(graph, 3, none);
    const late = visibleIds(graph, STAGE_MAX, none);
    assert.ok(early.length < late.length);
    const roof = Object.values(graph.components).find((c) => c.type === "rafter")!;
    assert.equal(isStageVisible(roof, 4, none), false);
    assert.equal(isStageVisible(roof, 11, none), true);
  });

  it("dependency stage numbers are within the sequence", () => {
    for (const c of Object.values(graph.components)) {
      assert.ok(c.assembly.stage >= STAGE_MIN && c.assembly.stage <= STAGE_MAX);
    }
  });

  it("reset completed specimen shows all boxes", () => {
    const all = visibleIds(graph, STAGE_MAX, none);
    const boxes = Object.values(graph.components).filter(
      (c) => c.geometry.kind === "box" && c.assembly.untilStage == null,
    );
    assert.equal(all.length, boxes.length);
  });
});
