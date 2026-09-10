import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { findSequenceViolations, whyNotYet } from "./dag.ts";

describe("construction sequence DAG", () => {
  it("complete intact house has no missing-prerequisite findings against remaining members", () => {
    const graph = buildPeiHouse();
    const hits = findSequenceViolations(graph, 23, []).filter((h) => h.kind === "MISSING_PREREQUISITE" && h.reason.includes("is missing"));
    assert.deepEqual(hits, []);
  });

  it("removing the foundation flags the sill", () => {
    const graph = buildPeiHouse();
    const hits = findSequenceViolations(graph, 23, ["fdn.front"]);
    assert.ok(hits.some((h) => h.a.includes("sill") || h.b === "fdn.front"), JSON.stringify(hits.slice(0, 5)));
  });

  it("why-not-yet reports a missing host", () => {
    const graph = buildPeiHouse();
    const reasons = whyNotYet(graph, "sill.front", 23, ["fdn.front"]);
    assert.ok(reasons.some((r) => /cannot happen yet/i.test(r)), reasons.join(" | "));
  });
});
