import type { AuthorityCategory } from "@/crates/building-graph/types";

export type SourceKind =
  | "official-legislation"
  | "official-news"
  | "official-agency"
  | "code-development-body"
  | "secondary-consolidation"
  | "project";

export type SourceReference = {
  id: string;
  organization: string;
  title: string;
  locator: string;
  retrieved: string;
  kind: SourceKind;
  notes?: string;
};

export type RuleProvenance = {
  authority: AuthorityCategory;
  sourceIds: string[];
  provisionIds?: string[];
  wording: "quoted" | "paraphrased" | "executable-logic-only" | "none";
  verification: "verified" | "provisional" | "demo-only" | "unverified";
};
