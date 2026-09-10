import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { evaluateRules } from "./engine.ts";

function run(removed: string[]) {
  const graph = buildPeiHouse();
  return evaluateRules(graph, {
    jurisdictionId: graph.jurisdictionId,
    projectDate: graph.projectDate,
    removedIds: removed,
    hiddenIds: [],
    now: "2026-09-10T12:00:00.000Z",
  });
}

describe("rule engine", () => {
  it("PASS when the specimen is intact", () => {
    const results = run([]);
    const load = results.find((r) => r.ruleId === "DEMO-LOADPATH-001")!;
    const opening = results.find((r) => r.ruleId === "DEMO-OPENING-001")!;
    assert.equal(load.verdict, "PASS");
    assert.equal(opening.verdict, "PASS");
  });

  it("FAIL when a jack stud is removed under a header", () => {
    const graph = buildPeiHouse();
    const jack = Object.values(graph.components).find((c) => c.type === "jack-stud")!;
    const results = run([jack.id]);
    const load = results.find((r) => r.ruleId === "DEMO-LOADPATH-001")!;
    const opening = results.find((r) => r.ruleId === "DEMO-OPENING-001")!;
    assert.equal(load.verdict, "FAIL");
    assert.equal(opening.verdict, "FAIL");
    assert.ok(load.componentIds.includes(jack.id) || opening.componentIds.includes(jack.id));
  });

  it("MISSING_INFORMATION for snow/rafter capacity", () => {
    const missing = run([]).find((r) => r.ruleId === "NBC-SNOW-001")!;
    assert.equal(missing.verdict, "MISSING_INFORMATION");
  });

  it("UNCERTAIN for unspecified lumber grade", () => {
    const u = run([]).find((r) => r.ruleId === "LUMBER-GRADE-001")!;
    assert.equal(u.verdict, "UNCERTAIN");
  });

  it("same input yields the same result", () => {
    const graph = buildPeiHouse();
    const jack = Object.values(graph.components).find((c) => c.type === "jack-stud")!;
    const a = run([jack.id]);
    const b = run([jack.id]);
    assert.deepEqual(
      a.map((r) => [r.ruleId, r.verdict, r.componentIds]),
      b.map((r) => [r.ruleId, r.verdict, r.componentIds]),
    );
  });

  it("every rule has an authority category", () => {
    for (const r of run([])) {
      assert.ok(r.provenance.authority);
      if (r.provenance.authority === "OFFICIAL_REGULATION") {
        assert.ok(r.provenance.sourceIds.length > 0);
      }
    }
  });
});
