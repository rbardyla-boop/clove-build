import type { Rule } from "@/crates/rule-engine/types";

const DEMO = {
  authority: "EDUCATIONAL_DEMO_RULE" as const,
  sourceIds: ["clove-demo-pack"],
  wording: "executable-logic-only" as const,
  verification: "demo-only" as const,
};

export const DEMO_PACK_VERSION = "0.1.0";

export const demoRules: Rule[] = [
  {
    id: "DEMO-LOADPATH-001",
    title: "Required support still present",
    packVersion: DEMO_PACK_VERSION,
    provenance: DEMO,
    authorityLabel: "Clove educational demonstration rule — not a representation of an NBC clause",
    evaluate: (ctx, lookup) => {
      const failed: string[] = [];
      const all = [
        ...lookup.idsByType("header"),
        ...lookup.idsByType("jack-stud"),
        ...lookup.idsByType("floor-joist"),
        ...lookup.idsByType("beam"),
        ...lookup.idsByType("column"),
        ...lookup.idsByType("sill-plate"),
        ...lookup.idsByType("rafter"),
      ];
      for (const id of all) {
        if (lookup.isRemoved(id)) continue;
        if (!lookup.required(id) && lookup.typeOf(id) !== "header") continue;
        for (const support of lookup.supportedBy(id)) {
          if (lookup.isRemoved(support)) failed.push(id, support);
        }
      }
      const unique = [...new Set(failed)];
      if (unique.length === 0) {
        return {
          verdict: "PASS",
          componentIds: [],
          inputs: { removed: ctx.removedIds.length },
          reason: "Every still-present dependency-critical member has its modelled supports.",
          assumption: "This checks the specimen graph, not structural capacity.",
        };
      }
      return {
        verdict: "FAIL",
        componentIds: unique,
        inputs: { removed: ctx.removedIds.length, broken: unique.length },
        reason: "A required support dependency has been intentionally removed, so the modelled load path is incomplete.",
        assumption: "Graph integrity is not a substitute for engineering analysis.",
      };
    },
  },
  {
    id: "DEMO-OPENING-001",
    title: "Window / door opening assembly complete",
    packVersion: DEMO_PACK_VERSION,
    provenance: DEMO,
    authorityLabel: "Clove educational demonstration rule — not a permit determination",
    evaluate: (_ctx, lookup) => {
      const headers = lookup.idsByType("header");
      const missing: string[] = [];
      const affected: string[] = [];
      for (const h of headers) {
        const still = !lookup.isRemoved(h);
        const supports = lookup.supportedBy(h);
        const jacksGone = supports.filter((id) => lookup.isRemoved(id));
        if (!still || jacksGone.length) {
          missing.push(h, ...jacksGone);
          affected.push(h, ...supports);
        }
      }
      const unique = [...new Set(affected)];
      if (unique.length === 0 || missing.length === 0) {
        return {
          verdict: "PASS",
          componentIds: [],
          inputs: { headers: headers.length },
          reason: "Each modelled header still exists and still bears on its jack studs.",
        };
      }
      return {
        verdict: "FAIL",
        componentIds: [...new Set(missing)],
        inputs: { headers: headers.length },
        reason: "Opening assembly dependency incomplete — a header and/or its jack studs were removed.",
        assumption: "The lesson is topological: the header is modelled as sitting on the jacks.",
      };
    },
  },
  {
    id: "DEMO-SILL-001",
    title: "Sill remains on the foundation path",
    packVersion: DEMO_PACK_VERSION,
    provenance: DEMO,
    authorityLabel: "Clove educational demonstration rule",
    evaluate: (_ctx, lookup) => {
      const sills = lookup.idsByType("sill-plate");
      const gone = sills.filter((id) => lookup.isRemoved(id));
      if (gone.length === 0) {
        return {
          verdict: "PASS",
          componentIds: [],
          inputs: { sills: sills.length },
          reason: "All modelled sill plates remain. Floor members still have a wood-to-concrete transition in the graph.",
        };
      }
      return {
        verdict: "FAIL",
        componentIds: gone,
        inputs: { sills: sills.length, removed: gone.length },
        reason: "A sill plate was removed. In this specimen the sill is the required transition from foundation to floor framing.",
      };
    },
  },
  {
    id: "NBC-SNOW-001",
    title: "Roof snow load / rafter capacity",
    packVersion: DEMO_PACK_VERSION,
    provenance: {
      authority: "UNKNOWN",
      sourceIds: ["nrc-nbc-2020"],
      wording: "none",
      verification: "unverified",
    },
    authorityLabel: "Not evaluated — climatic data and licensed span tables are absent",
    evaluate: () => ({
      verdict: "MISSING_INFORMATION",
      componentIds: [],
      inputs: { snowLoadKPa: null, rafterGrade: null, spanTables: null },
      reason:
        "This specimen does not contain PEI climatic snow load, lumber grade, or licensed NBC span tables. Rafter size cannot be determined here.",
      assumption: "Absence of data is reported as MISSING INFORMATION rather than a guessed PASS/FAIL.",
      sourceRefs: ["nrc-nbc-2020"],
    }),
  },
  {
    id: "LUMBER-GRADE-001",
    title: "Sill plate species and grade",
    packVersion: DEMO_PACK_VERSION,
    provenance: {
      authority: "INFERENCE",
      sourceIds: [],
      wording: "none",
      verification: "unverified",
    },
    authorityLabel: "Uncertain — specimen does not specify grade",
    evaluate: (_ctx, lookup) => {
      const sills = lookup.idsByType("sill-plate");
      return {
        verdict: "UNCERTAIN",
        componentIds: sills,
        inputs: { species: null, grade: null, treatment: "labelled treated, specification unknown" },
        reason:
          "Sill plates are modelled as preservative-treated lumber, but species, grade, and treatment specification are not in the graph. Whether they satisfy an applicable provision cannot be decided.",
        assumption: "Visual colour is not evidence of compliance.",
      };
    },
  },
  {
    id: "PEI-NBC2025-001",
    title: "Whether NBC 2025 applies in PEI on the project date",
    packVersion: DEMO_PACK_VERSION,
    provenance: {
      authority: "OFFICIAL_REGULATION",
      sourceIds: ["cbhcc-pt-adoption", "nrc-publications", "pei-news-2024-03-08"],
      wording: "paraphrased",
      verification: "provisional",
    },
    authorityLabel: "Jurisdiction fact — adoption of NBC 2025 in PEI is not verified",
    evaluate: (ctx) => ({
      verdict: "UNCERTAIN",
      componentIds: [],
      inputs: {
        projectDate: ctx.projectDate,
        verifiedPeiNbc2020From: "2024-03-31",
        nrcListsNbc2025: true,
        peiNbc2025Instrument: null,
      },
      reason:
        "PEI’s verified adoption instrument in this pack is NBC 2020 (enforced 31 March 2024). NRC publishes NBC 2025, but no PEI 2025 adoption instrument was verified on retrieval. The applicable edition on the project date is therefore uncertain.",
      assumption: "This application will not infer that a newer national edition is in force locally.",
      sourceRefs: ["cbhcc-pt-adoption", "nrc-publications"],
    }),
  },
];
