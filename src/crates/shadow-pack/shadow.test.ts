import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { demoRules } from "../../rule-packs/demo/rules.ts";
import { evaluateRules } from "../rule-engine/engine.ts";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { inspectLocalCodeReference } from "./local-reference.ts";
import { shadowFromRule } from "./types.ts";

describe("shadow rule pack", () => {
  const graph = buildPeiHouse();

  it("every shipped rule is a shadow record: original wording, text not distributed, no content licence", () => {
    for (const rule of demoRules) {
      const shadow = shadowFromRule(rule, graph.jurisdictionId);
      assert.equal(shadow.model, "executable-logic-only");
      assert.equal(shadow.explanationPolicy, "original-wording");
      assert.equal(shadow.sourceText, "NOT_DISTRIBUTED");
      assert.equal(shadow.licenceState, "content-rights-not-granted");
      assert.notEqual(rule.provenance.wording, "quoted");
    }
  });

  it("evaluations stamp NOT_DISTRIBUTED even when provenance omitted the field", () => {
    const results = evaluateRules(graph, {
      jurisdictionId: graph.jurisdictionId,
      projectDate: graph.projectDate,
      removedIds: [],
      hiddenIds: [],
      now: "2026-09-10T12:00:00.000Z",
    });
    assert.ok(results.length > 0);
    for (const r of results) {
      assert.equal(r.sourceText, "NOT_DISTRIBUTED");
      assert.equal(r.licenceState, "content-rights-not-granted");
      assert.notEqual(r.provenance.wording, "quoted");
    }
  });

  it("local code reference is absent by default and never used by the engine", () => {
    const hit = inspectLocalCodeReference(process.cwd());
    assert.equal(hit.usedByEngine, false);
    assert.ok(hit.note.includes("does not read"));
  });

  it("a private folder of PDFs is listed by name only — contents are not returned", () => {
    const root = mkdtempSync(join(tmpdir(), "clove-ref-"));
    mkdirSync(join(root, "private-reference"));
    writeFileSync(join(root, "private-reference", "NBC-2020-secret.txt"), "THIS WOULD BE PROTECTED TEXT IF IT WERE THE CODE\n".repeat(40));
    const hit = inspectLocalCodeReference(root);
    assert.equal(hit.present, true);
    assert.deepEqual(hit.files, ["NBC-2020-secret.txt"]);
    assert.equal(hit.usedByEngine, false);
    assert.equal(JSON.stringify(hit).includes("PROTECTED TEXT"), false);
  });
});
