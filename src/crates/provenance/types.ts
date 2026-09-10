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

/**
 * Whether Clove may redistribute the official provision wording.
 * Free-to-read PDFs are not a redistribution licence.
 */
export type ContentLicenceState =
  | "content-rights-not-granted"
  | "local-reference-only"
  | "licensed-redistribution"
  | "public-domain"
  | "crown-citation-only";

/** Official paragraph policy. The public product never ships protected text. */
export type SourceTextPolicy = "NOT_DISTRIBUTED" | "QUOTED_UNDER_LICENCE";

export type CodeFamily = "NBC" | "NPC" | "NFC" | "NECB" | "CEC" | "B149" | "PROVINCIAL" | "DEMO";

/** Pointer only. Never store the provision wording on this object. */
export type ProvisionPointer = {
  family: CodeFamily;
  edition: string;
  part?: string;
  provision?: string;
};

export type RuleProvenance = {
  authority: AuthorityCategory;
  sourceIds: string[];
  provisionIds?: string[];
  provision?: ProvisionPointer;
  wording: "quoted" | "paraphrased" | "executable-logic-only" | "none";
  verification: "verified" | "provisional" | "demo-only" | "unverified";
  licenceState?: ContentLicenceState;
  sourceText?: SourceTextPolicy;
};

export const DEFAULT_LICENCE_STATE: ContentLicenceState = "content-rights-not-granted";
export const DEFAULT_SOURCE_TEXT: SourceTextPolicy = "NOT_DISTRIBUTED";
