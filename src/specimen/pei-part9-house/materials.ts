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
  copper: { id: "copper-pipe", label: "Copper water tube (demonstration)", family: "copper" },
  pex: { id: "pex", label: "PEX water tube (demonstration)", family: "plastic" },
  abs: { id: "abs-dwv", label: "ABS DWV pipe (demonstration)", family: "plastic" },
  pvc: { id: "pvc-vent", label: "PVC vent pipe (demonstration)", family: "plastic" },
  porcelain: { id: "fixture", label: "Plumbing fixture (demonstration)", family: "gypsum" },
  panel: { id: "panelboard", label: "Loadcentre enclosure (demonstration)", family: "metal" },
  cable: { id: "nm-b", label: "Non-metallic sheathed cable (demonstration)", family: "cable" },
  device: { id: "device", label: "Wiring device (demonstration)", family: "plastic" },
  steel: { id: "galvanized", label: "Sheet steel (demonstration)", family: "metal" },
  insulation: { id: "batt", label: "Mineral-fibre batt (demonstration)", family: "insulation" },
  poly: { id: "poly", label: "Polyethylene sheet (demonstration)", family: "membrane" },
  wrap: { id: "wrb", label: "Water-resistive barrier (demonstration)", family: "membrane" },
  felt: { id: "underlayment", label: "Roof underlayment (demonstration)", family: "membrane" },
  shingle: { id: "asphalt-shingle", label: "Asphalt shingles (demonstration)", family: "roofing" },
  cladding: { id: "lap-siding", label: "Lap siding (demonstration)", family: "cladding" },
  gypsum: { id: "gypsum", label: "Gypsum board (demonstration)", family: "gypsum" },
  paint: { id: "paint", label: "Interior paint film (demonstration)", family: "paint" },
  flooring: { id: "floor-finish", label: "Floor finish (demonstration)", family: "wood" },
  glass: { id: "glazing", label: "Window unit (demonstration)", family: "membrane" },
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

export const PROV_SCIENCE = {
  jurisdiction: "ca-pei",
  status: "demo-only" as const,
  authority: "BUILDING_SCIENCE" as const,
};

export const PROV_TRADE = {
  jurisdiction: "ca-pei",
  status: "demo-only" as const,
  authority: "TRADE_PRACTICE" as const,
};
