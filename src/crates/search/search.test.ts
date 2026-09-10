import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { applyCommand, createSnapshot } from "../session/apply.ts";
import { searchComponents } from "./index.ts";

describe("semantic search and show-me", () => {
  const graph = buildPeiHouse();

  it("finds header, kitchen drain, main panel, vapour barrier, bathroom exhaust, window flashing, cold water, joist", () => {
    const queries = [
      "header",
      "kitchen drain",
      "main panel",
      "vapour barrier",
      "bathroom exhaust",
      "window flashing",
      "cold water",
      "joist",
    ];
    for (const q of queries) {
      const hits = searchComponents(graph, q);
      assert.ok(hits.length > 0, q);
    }
  });

  it("show me why isolates the finding and fits", () => {
    let s = createSnapshot(graph);
    s = applyCommand(s, { type: "SHOW_ME", ids: ["electrical.panel.main"], reason: "where" });
    assert.equal(s.selectedId, "electrical.panel.main");
    assert.equal(s.cameraCommand, "fit-selected");
    assert.equal(s.hideFinish, true);
    assert.ok(s.isolatedIds?.includes("electrical.panel.main"));
  });
});
