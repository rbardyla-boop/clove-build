/** Nominal dimensional lumber, dressed metric sizes used in the specimen. */
export const LUMBER = {
  "2x4": { t: 0.038, d: 0.089, label: "38 × 89 mm (2×4)" },
  "2x6": { t: 0.038, d: 0.14, label: "38 × 140 mm (2×6)" },
  "2x8": { t: 0.038, d: 0.184, label: "38 × 184 mm (2×8)" },
  "2x10": { t: 0.038, d: 0.235, label: "38 × 235 mm (2×10)" },
  "2x12": { t: 0.038, d: 0.286, label: "38 × 286 mm (2×12)" },
  "4x4": { t: 0.089, d: 0.089, label: "89 × 89 mm (4×4)" },
  "6x6": { t: 0.14, d: 0.14, label: "140 × 140 mm (6×6)" },
} as const;

export type LumberKey = keyof typeof LUMBER;

export const SHEATHING_OSB = 0.012;
export const SUBFLOOR = 0.018;
export const CONCRETE_WALL = 0.2;
export const FOOTING_T = 0.2;
export const FOOTING_W = 0.6;
