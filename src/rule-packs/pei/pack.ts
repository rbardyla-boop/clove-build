import type { JurisdictionPack } from "@/crates/jurisdiction/types";

/** Retrieved 2026-09-10. See research/source-manifest.json. */
export const PEI_PACK: JurisdictionPack = {
  id: "ca-pei",
  country: "Canada",
  provinceOrTerritory: "Prince Edward Island",
  effectiveFrom: "2024-03-31",
  adoptedCodeEditions: [
    {
      family: "NBC",
      edition: "2020",
      energyTier: "Energy Performance Tier 1",
      adopted: "full",
      enforcementDate: "2024-03-31",
    },
    {
      family: "NECB",
      edition: "2020",
      energyTier: "Energy Performance Tier 1",
      adopted: "full",
      enforcementDate: "2024-03-31",
    },
  ],
  amendments: [
    {
      id: "pei-ec177-20-schedules",
      summary:
        "PEI Building Codes Regulations (EC177/20) adopt NBC 2020 with modifications specified in Schedules A and B. Schedule contents are not encoded as executable rules in v0.1.",
      sourceId: "canlii-ec177-20",
      verification: "provisional",
    },
  ],
  sources: [
    {
      id: "pei-news-2024-03-08",
      organization: "Government of Prince Edward Island",
      title: "New building codes take effect March 31",
      locator: "https://www.princeedwardisland.ca/en/news/new-building-codes-take-effect-march-31",
      retrieved: "2026-09-10",
      kind: "official-news",
      notes:
        "Announces amendments to Building Codes Act Regulations adopting the 2020 national building and energy codes, effective 31 March 2024. In-progress projects remain under 2015 editions.",
    },
    {
      id: "cbhcc-pt-adoption",
      organization: "Canadian Board for Harmonized Construction Codes",
      title: "Provincial/Territorial adoption",
      locator: "https://cbhcc-cchcc.ca/en/provincial-territorial-adoption/",
      retrieved: "2026-09-10",
      kind: "code-development-body",
      notes:
        "Table (edition in effect as of August 2024): PEI NBC 2020 Energy Performance Tier 1, adopted in full, enforcement 31 March 2024.",
    },
    {
      id: "canlii-ec177-20",
      organization: "Prince Edward Island (via CanLII office consolidation)",
      title: "Building Codes Regulations, PEI Reg EC177/20",
      locator: "https://www.canlii.org/en/pe/laws/regu/pei-reg-ec177-20/latest/pei-reg-ec177-20.html",
      retrieved: "2026-09-10",
      kind: "secondary-consolidation",
      notes:
        "Office consolidation current to 31 March 2024. Section 2(1) adopts NBC 2020 with Schedules A and B; section 2(2) adopts NECB 2020 (EC177/20; 179/24). Not the official Gazette text.",
    },
    {
      id: "pei-bca",
      organization: "Government of Prince Edward Island",
      title: "Building Codes Act, R.S.P.E.I. 1988, Cap. B-5.1",
      locator: "https://www.princeedwardisland.ca/sites/default/files/8a92/B-05-1-Building%20Codes%20Act.pdf",
      retrieved: "2026-09-10",
      kind: "official-legislation",
      notes: "Enabling statute. s.32 authorizes adoption of specified NBC/NECB editions by regulation.",
    },
    {
      id: "nrc-nbc-2020",
      organization: "National Research Council of Canada",
      title: "National Building Code of Canada 2020",
      locator:
        "https://nrc.canada.ca/en/certifications-evaluations-standards/codes-canada/codes-canada-publications/national-building-code-canada-2020",
      retrieved: "2026-09-10",
      kind: "official-agency",
      notes:
        "NBC 2020 is developed under the (then) CCBFC / now CBHCC and published by NRC. Substantial reproduction of code text is not licensed to this project.",
    },
    {
      id: "nrc-publications",
      organization: "National Research Council of Canada",
      title: "Codes Canada publications",
      locator:
        "https://nrc.canada.ca/en/certifications-evaluations-standards/codes-canada/codes-canada-publications",
      retrieved: "2026-09-10",
      kind: "official-agency",
      notes:
        "NRC lists NBC 2025 among current publications. PEI adoption of the 2025 edition was not verified on 2026-09-10.",
    },
  ],
  buildingType: "Detached demonstration house (Part 9 orientation)",
  codeFamilyLabel: "NBC 2020 / PEI adoption context",
  regulatoryStatus: "Educational prototype — not a permit determination",
};

export function packForDate(dateIso: string): JurisdictionPack {
  const date = dateIso.slice(0, 10);
  if (PEI_PACK.effectiveFrom && date < PEI_PACK.effectiveFrom) {
    return {
      ...PEI_PACK,
      adoptedCodeEditions: [
        {
          family: "NBC",
          edition: "2015",
          adopted: "unknown",
          enforcementDate: undefined,
        },
      ],
      regulatoryStatus:
        "Project date is before the verified 31 Mar 2024 NBC 2020 PEI enforcement date. 2015 context is noted from official news about in-progress projects, not fully encoded.",
    };
  }
  return PEI_PACK;
}
