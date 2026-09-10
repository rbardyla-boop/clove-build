import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { buildSlabCottage } from "../../specimen/slab-cottage/index.ts";
import { buildRuralPoolHouse } from "../../specimen/rural-pool/index.ts";
import { findEnvelopeOpeningIssues, findKnownDefects, findPoolSpaIssues } from "./detectors.ts";
import { KNOWN_FAILURES, openFailuresFor } from "./registry.ts";

describe("known failures (open, not repaired)", () => {
  it("registry lists the two Ryan visual defects as OPEN", () => {
    const ids = KNOWN_FAILURES.filter((f) => f.status === "OPEN").map((f) => f.id);
    assert.ok(ids.includes("ENVELOPE-OPENING-001"));
    assert.ok(ids.includes("POOL-SPA-001"));
  });

  it("ENVELOPE-OPENING-001 still fires on all three dwellings", () => {
    for (const g of [buildPeiHouse(), buildSlabCottage(), buildRuralPoolHouse()]) {
      const hits = findEnvelopeOpeningIssues(g);
      assert.ok(hits.length >= 1, `${g.id} expected envelope-over-opening; if empty, the defect was repaired — flip this test to a regression`);
      assert.ok(hits.every((h) => h.failureId === "ENVELOPE-OPENING-001"));
    }
  });

  it("POOL-SPA-001 still fires on the rural specimen only", () => {
    assert.equal(findPoolSpaIssues(buildPeiHouse()).length, 0);
    assert.equal(findPoolSpaIssues(buildSlabCottage()).length, 0);
    const rural = findPoolSpaIssues(buildRuralPoolHouse());
    assert.ok(rural.length >= 1, "if empty, pool/hot-tub no longer collide — flip this test to a regression");
  });

  it("openFailuresFor matches detectors on the rural graph", () => {
    const g = buildRuralPoolHouse();
    const open = openFailuresFor(g.id).map((f) => f.id);
    const found = new Set(findKnownDefects(g).map((h) => h.failureId));
    assert.ok(open.includes("ENVELOPE-OPENING-001") && found.has("ENVELOPE-OPENING-001"));
    assert.ok(open.includes("POOL-SPA-001") && found.has("POOL-SPA-001"));
  });
});
