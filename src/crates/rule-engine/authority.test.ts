import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { evaluateRules } from "./engine.ts";

function run(removed: string[] = []) {
  const graph = buildPeiHouse();
  return evaluateRules(graph, {
    jurisdictionId: graph.jurisdictionId,
    projectDate: graph.projectDate,
    removedIds: removed,
    hiddenIds: [],
    now: "2026-09-10T12:00:00.000Z",
  });
}

describe("rule authority gauntlet", () => {
  it("never invents NPC, CEC or NBC clause PASS when data is absent", () => {
    const results = run();
    const guarded = results.filter((r) =>
      ["NBC-SNOW-001", "PLUMB-NPC-TEXT-001", "ELEC-CEC-TEXT-001", "PEI-ENERGY-PATH-001", "PEI-NPC2025-001", "PEI-NBC2025-001"].includes(
        r.ruleId,
      ),
    );
    assert.ok(guarded.length >= 5);
    for (const r of guarded) {
      assert.notEqual(r.verdict, "PASS");
      assert.ok(r.verdict === "MISSING_INFORMATION" || r.verdict === "UNCERTAIN");
      assert.notEqual(r.provenance.authority, "AI_INFERRED");
    }
  });

  it("a false authoritative PASS is impossible for unverified energy path", () => {
    const energy = run().find((r) => r.ruleId === "PEI-ENERGY-PATH-001")!;
    assert.equal(energy.verdict, "MISSING_INFORMATION");
    assert.equal(energy.provenance.authority, "OFFICIAL_REGULATION");
  });

  it("educational topology FAIL is not labelled official regulation", () => {
    const r = run(["plumbing.dwv.trap.lav.001"]).find((x) => x.ruleId === "PLUMB-TOPOLOGY-001")!;
    assert.equal(r.verdict, "FAIL");
    assert.equal(r.provenance.authority, "EDUCATIONAL_DEMO_RULE");
  });

  it("intact house still PASSes structural demo rules", () => {
    const results = run();
    assert.equal(results.find((r) => r.ruleId === "DEMO-LOADPATH-001")!.verdict, "PASS");
    assert.equal(results.find((r) => r.ruleId === "DEMO-OPENING-001")!.verdict, "PASS");
    assert.equal(results.find((r) => r.ruleId === "PLUMB-TOPOLOGY-001")!.verdict, "PASS");
    assert.equal(results.find((r) => r.ruleId === "ELEC-TOPOLOGY-001")!.verdict, "PASS");
    assert.equal(results.find((r) => r.ruleId === "HVAC-TOPOLOGY-001")!.verdict, "PASS");
    assert.equal(results.find((r) => r.ruleId === "CROSS-ROUTE-001")!.verdict, "PASS");
    assert.equal(results.find((r) => r.ruleId === "CROSS-ROUTE-002")!.verdict, "PASS");
  });

  it("AI_INFERRED is never a PASS", () => {
    for (const r of run()) {
      if (r.provenance.authority === "AI_INFERRED" || r.provenance.authority === "INFERENCE") {
        assert.notEqual(r.verdict, "PASS");
      }
    }
  });

  it("shipped evaluations never quote official code text", () => {
    for (const r of run()) {
      assert.equal(r.sourceText, "NOT_DISTRIBUTED");
      assert.equal(r.licenceState, "content-rights-not-granted");
      assert.notEqual(r.provenance.wording, "quoted");
    }
  });
});
