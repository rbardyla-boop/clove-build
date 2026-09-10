import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { inspectLocalCodeReference } from "../shadow-pack/local-reference.ts";
import { contributionIsShippable, type RuleContribution } from "./schema.ts";
import { futureStructuredCodeAdapter } from "../machine-readable/adapter.ts";
import { rankSourceKind, SOURCE_PRECEDENCE } from "../source-precedence/rank.ts";

describe("contribution, licence, and precedence", () => {
  it("rejects shipping official wording without rights", () => {
    const bad: RuleContribution = {
      jurisdiction: "ca-pei",
      codeFamily: "NBC",
      edition: "2020",
      provisionIdentifier: "9.23.10.1.",
      authority: "OFFICIAL_REGULATION",
      sourceUrl: "https://nrc.canada.ca/",
      inputs: [],
      predicate: "false",
      originalExplanation: "our words",
      testCases: [],
      verification: "unverified",
      sourceTextDistributed: false,
      contentRightsGranted: false,
      licenceState: "content-rights-not-granted",
      sourceText: "NOT_DISTRIBUTED",
      officialWording: "substantial protected paragraph",
    };
    const hit = contributionIsShippable(bad);
    assert.equal(hit.ok, false);
  });

  it("local reference is never used by the engine", () => {
    const ref = inspectLocalCodeReference();
    assert.equal(ref.usedByEngine, false);
  });

  it("structured code import is unimplemented", async () => {
    await assert.rejects(
      () => futureStructuredCodeAdapter.importDocument({ format: "json", bytes: new Uint8Array() }),
      /not implemented/,
    );
  });

  it("statute outranks a secondary consolidation", () => {
    assert.ok(SOURCE_PRECEDENCE.indexOf("IN-FORCE STATUTE / REGULATION") < SOURCE_PRECEDENCE.indexOf("SECONDARY SOURCE"));
    assert.equal(rankSourceKind("official-legislation"), "IN-FORCE STATUTE / REGULATION");
    assert.equal(rankSourceKind("secondary-consolidation"), "SECONDARY SOURCE");
  });
});
