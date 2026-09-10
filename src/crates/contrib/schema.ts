import type { AuthorityCategory } from "@/crates/building-graph/types";
import type { CodeFamily, ContentLicenceState, SourceTextPolicy } from "@/crates/provenance/types";
import type { RuleVerdict } from "@/crates/rule-engine/types";

/**
 * Machine-readable contribution envelope.
 * Protected source wording is optional and must not be committed
 * unless content rights are explicitly established.
 */
export type RuleContribution = {
  jurisdiction: string;
  codeFamily: CodeFamily;
  edition: string;
  provisionIdentifier?: string;
  authority: AuthorityCategory;
  sourceUrl: string;
  effectiveDate?: string;
  inputs: string[];
  predicate: string;
  originalExplanation: string;
  testCases: { name: string; expect: RuleVerdict }[];
  verification: "unverified" | "provisional" | "human-reviewed";
  sourceTextDistributed: false;
  contentRightsGranted: boolean;
  licenceState: ContentLicenceState;
  sourceText: SourceTextPolicy;
  officialWording?: string;
};

export function contributionIsShippable(c: RuleContribution): { ok: boolean; reason?: string } {
  if (c.sourceTextDistributed) return { ok: false, reason: "source text must not be distributed" };
  if (c.officialWording && !c.contentRightsGranted) {
    return { ok: false, reason: "official wording present without content rights" };
  }
  if (!c.originalExplanation.trim()) return { ok: false, reason: "original explanation required" };
  if (!c.sourceUrl.trim()) return { ok: false, reason: "source URL required" };
  return { ok: true };
}
