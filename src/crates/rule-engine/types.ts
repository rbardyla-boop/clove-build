import type { AuthorityCategory, TradeId } from "@/crates/building-graph/types";
import type { RuleProvenance } from "@/crates/provenance/types";

export type RuleVerdict = "PASS" | "FAIL" | "MISSING_INFORMATION" | "UNCERTAIN";

export type RuleDomain = TradeId | "cross-trade" | "jurisdiction";

export type RuleEvaluation = {
  ruleId: string;
  title: string;
  verdict: RuleVerdict;
  domain: RuleDomain;
  componentIds: string[];
  inputs: Record<string, string | number | boolean | null | undefined>;
  reason: string;
  assumption?: string;
  sourceRefs: string[];
  jurisdiction: string;
  rulePackVersion: string;
  evaluatedAt: string;
  provenance: RuleProvenance;
  authorityLabel: string;
};

/**
 * v1 rules evaluate the planned graph plus Break It overlay.
 * Site evidence, when it exists, must not be smuggled into the graph.
 * Later evaluations may read observations beside this context;
 * AI_INFERRED is never a PASS.
 */
export type RuleContext = {
  graphId: string;
  graphVersion: string;
  jurisdictionId: string;
  projectDate: string;
  removedIds: readonly string[];
  hiddenIds: readonly string[];
  now: string;
};

export type Rule = {
  id: string;
  title: string;
  packVersion: string;
  domain: RuleDomain;
  provenance: RuleProvenance;
  authorityLabel: string;
  evaluate: (ctx: RuleContext, lookup: RuleLookup) => Omit<RuleEvaluation, "evaluatedAt" | "jurisdiction" | "rulePackVersion" | "ruleId" | "title" | "provenance" | "authorityLabel" | "sourceRefs" | "domain"> & {
    sourceRefs?: string[];
  };
};

export type RuleLookup = {
  has: (id: string) => boolean;
  isRemoved: (id: string) => boolean;
  typeOf: (id: string) => string | undefined;
  idsByType: (type: string) => string[];
  idsByTag: (tag: string) => string[];
  supportedBy: (id: string) => string[];
  required: (id: string) => boolean;
  label: (id: string) => string;
};
