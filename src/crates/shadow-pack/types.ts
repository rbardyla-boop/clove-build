import type { ContentLicenceState, ProvisionPointer, SourceTextPolicy } from "@/crates/provenance/types";
import type { Rule, RuleDomain } from "@/crates/rule-engine/types";

/**
 * Shadow rule pack record.
 *
 * Executable software, original explanation, and a citation pointer ship.
 * The official provision paragraph does not.
 *
 * This is the object we can later take to NRC/CSA: "here are N working
 * predicates; none of your protected text was redistributed; we want a
 * machine-readable licence."
 */
export type ShadowRuleRecord = {
  id: string;
  jurisdictionId: string;
  domain: RuleDomain;
  provision?: ProvisionPointer;
  model: "executable-logic-only";
  explanationPolicy: "original-wording";
  sourceText: SourceTextPolicy;
  verification: "human-reviewed" | "demo-only" | "provisional" | "unverified";
  licenceState: ContentLicenceState;
};

export function shadowFromRule(rule: Rule, jurisdictionId: string): ShadowRuleRecord {
  return {
    id: rule.id,
    jurisdictionId,
    domain: rule.domain,
    provision: rule.provenance.provision,
    model: "executable-logic-only",
    explanationPolicy: "original-wording",
    sourceText: rule.provenance.sourceText ?? "NOT_DISTRIBUTED",
    verification:
      rule.provenance.verification === "verified"
        ? "human-reviewed"
        : rule.provenance.verification === "demo-only"
          ? "demo-only"
          : rule.provenance.verification === "provisional"
            ? "provisional"
            : "unverified",
    licenceState: rule.provenance.licenceState ?? "content-rights-not-granted",
  };
}
