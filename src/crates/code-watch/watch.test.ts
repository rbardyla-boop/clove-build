import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CODE_WATCH_INTERFACE } from "./pipeline.ts";
import { diffSnapshots, inspectCodeWatch, snapshotManifest } from "./watch.ts";

describe("code watch", () => {
  it("is a human-gated pipeline and never auto-activates", () => {
    assert.ok(CODE_WATCH_INTERFACE.stages.includes("human-review"));
    assert.ok(CODE_WATCH_INTERFACE.stages.includes("activation"));
    const state = inspectCodeWatch();
    assert.equal(state.candidates.length, 0);
    assert.ok(state.snapshots.length >= 6);
  });

  it("a metadata hash change becomes a candidate that still requires review", () => {
    const now = snapshotManifest();
    const previous = now.map((s, i) => (i === 0 ? { ...s, sha256: "deadbeef" } : s));
    const candidates = diffSnapshots(previous, now);
    assert.ok(candidates.length >= 1);
    assert.equal(candidates[0]!.requiresHumanReview, true);
    assert.equal(candidates[0]!.autoActivate, false);
  });
});
