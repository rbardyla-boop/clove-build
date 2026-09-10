import type { MaterialDescriptor } from "@/crates/building-graph/types";

export const MAT = {
  soil: { id: "soil", label: "Site soil (demonstration)", family: "soil" },
  fill: { id: "excavation", label: "Excavated ground", family: "soil" },
  grass: { id: "grade", label: "Finished grade (simplified)", family: "context" },
  concrete: { id: "concrete", label: "Cast-in-place concrete", family: "concrete" },
  wood: { id: "spf", label: "SPF dimensional lumber (grade unspecified)", family: "wood" },
  treated: { id: "sill-treated", label: "Sill plate (preservative-treated, grade unspecified)", family: "wood-treated" },
  osb: { id: "osb", label: "Wood structural panel (OSB, demonstration)", family: "sheathing" },
  brace: { id: "temp-wood", label: "Temporary construction brace", family: "wood" },
} as const satisfies Record<string, MaterialDescriptor>;

export const PROV_MODEL = {
  jurisdiction: "ca-pei",
  status: "demo-only" as const,
  authority: "PROJECT_MODEL_ASSUMPTION" as const,
};

export const PROV_EDU = {
  jurisdiction: "ca-pei",
  status: "demo-only" as const,
  authority: "EDUCATIONAL_DEMO_RULE" as const,
};
