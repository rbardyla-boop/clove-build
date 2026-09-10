import type { SourceReference } from "@/crates/provenance/types";

export type CodeEditionReference = {
  family: string;
  edition: string;
  energyTier?: string;
  adopted: "full" | "with-variations" | "unknown";
  enforcementDate?: string;
};

export type AmendmentReference = {
  id: string;
  summary: string;
  sourceId?: string;
  verification: "verified" | "provisional" | "unverified";
};

export type JurisdictionPack = {
  id: string;
  country: string;
  provinceOrTerritory: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  adoptedCodeEditions: CodeEditionReference[];
  amendments: AmendmentReference[];
  sources: SourceReference[];
  buildingType: string;
  codeFamilyLabel: string;
  regulatoryStatus: string;
};
