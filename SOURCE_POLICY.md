# Source policy

Order of preference:

1. Government of Prince Edward Island legislation and official news
2. PEI building-program guidance
3. National Research Council / Codes Canada
4. Canadian Board for Harmonized Construction Codes
5. Standards bodies for metadata only when licensed text is inaccessible
6. Secondary sources only to locate primary material

For every regulatory fact in executable logic we store organisation, title, locator, retrieval date, verification state, and whether wording is quoted, paraphrased, or logic-only.

**Do not copy NBC, NPC, NECB or CEC text.** Freely available is not a redistribution licence. CSA’s Canadian Electrical Code is separately copyrighted.

If a needed fact is not verified, the engine returns MISSING_INFORMATION or UNCERTAIN. Guessing a PASS is a defect.

Adoption of a code *family* (NBC 2020, NPC 2020, CEC 2024) is not a licence to invent clause-level predicates. NECB 2020 adoption in PEI is not assumed as the energy path of this Part 9 house.

See `research/source-manifest.json` and `src/rule-packs/pei/pack.ts`.
