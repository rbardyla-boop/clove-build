/**
 * Planned construction sequence of THIS educational specimen.
 * Authority: PROJECT_CONSTRUCTION_SEQUENCE — not a legally mandatory order.
 */
export const CONSTRUCTION_STAGES = [
  { id: 1, key: "site", label: "Site", short: "Site", group: "foundation" },
  { id: 2, key: "excavation", label: "Excavation", short: "Excavate", group: "foundation" },
  { id: 3, key: "footing", label: "Footings", short: "Footing", group: "foundation" },
  { id: 4, key: "foundation", label: "Foundation", short: "Foundation", group: "foundation" },
  { id: 5, key: "sill", label: "Sill", short: "Sill", group: "structure" },
  { id: 6, key: "floor", label: "Floor framing", short: "Floor", group: "structure" },
  { id: 7, key: "subfloor", label: "Subfloor", short: "Subfloor", group: "structure" },
  { id: 8, key: "walls", label: "Wall plates & studs", short: "Walls", group: "structure" },
  { id: 9, key: "openings", label: "Opening framing", short: "Openings", group: "structure" },
  { id: 10, key: "sheathing", label: "Wall sheathing", short: "Sheathing", group: "structure" },
  { id: 11, key: "roof-frame", label: "Roof framing", short: "Roof", group: "structure" },
  { id: 12, key: "roof-deck", label: "Roof sheathing", short: "Deck", group: "structure" },
  { id: 13, key: "envelope", label: "Dry-in / envelope", short: "Envelope", group: "envelope" },
  { id: 14, key: "roofing", label: "Roofing & cladding", short: "Cladding", group: "envelope" },
  { id: 15, key: "rough-plumbing", label: "Rough plumbing", short: "Plumbing", group: "plumbing" },
  { id: 16, key: "rough-hvac", label: "Rough HVAC", short: "HVAC", group: "hvac" },
  { id: 17, key: "rough-electrical", label: "Rough electrical", short: "Electrical", group: "electrical" },
  { id: 18, key: "inspection-hold", label: "Rough inspection hold", short: "Hold", group: "cross" },
  { id: 19, key: "thermal", label: "Insulation & control layers", short: "Thermal", group: "thermal" },
  { id: 20, key: "drywall", label: "Drywall", short: "Drywall", group: "finish" },
  { id: 21, key: "devices", label: "Trim, devices & fixtures", short: "Trim", group: "finish" },
  { id: 22, key: "finish", label: "Interior finish", short: "Finish", group: "finish" },
  { id: 23, key: "complete", label: "Complete house", short: "Complete", group: "complete" },
] as const;

export const STAGE_MIN = 1;
export const STAGE_MAX = 23;

export type StageId = (typeof CONSTRUCTION_STAGES)[number]["id"];

export function stageLabel(id: number): string {
  return CONSTRUCTION_STAGES.find((s) => s.id === id)?.label ?? `Stage ${id}`;
}

export function clampStage(id: number): number {
  return Math.max(STAGE_MIN, Math.min(STAGE_MAX, Math.round(id)));
}
