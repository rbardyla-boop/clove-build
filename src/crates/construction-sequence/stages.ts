/**
 * Planned construction sequence of the specimen.
 * This is the educational scrubber, not observed jobsite progress.
 */
export const CONSTRUCTION_STAGES = [
  { id: 1, key: "site", label: "Site", short: "Site" },
  { id: 2, key: "excavation", label: "Excavation", short: "Excavate" },
  { id: 3, key: "footing", label: "Footings", short: "Footing" },
  { id: 4, key: "foundation", label: "Foundation", short: "Foundation" },
  { id: 5, key: "sill", label: "Sill", short: "Sill" },
  { id: 6, key: "floor", label: "Floor framing", short: "Floor" },
  { id: 7, key: "subfloor", label: "Subfloor", short: "Subfloor" },
  { id: 8, key: "walls", label: "Wall plates & studs", short: "Walls" },
  { id: 9, key: "openings", label: "Opening framing", short: "Openings" },
  { id: 10, key: "sheathing", label: "Wall sheathing", short: "Sheathing" },
  { id: 11, key: "roof-frame", label: "Roof framing", short: "Roof" },
  { id: 12, key: "roof-deck", label: "Roof sheathing", short: "Deck" },
  { id: 13, key: "complete", label: "Specimen complete", short: "Complete" },
] as const;

export const STAGE_MIN = 1;
export const STAGE_MAX = 13;

export type StageId = (typeof CONSTRUCTION_STAGES)[number]["id"];

export function stageLabel(id: number): string {
  return CONSTRUCTION_STAGES.find((s) => s.id === id)?.label ?? `Stage ${id}`;
}

export function clampStage(id: number): number {
  return Math.max(STAGE_MIN, Math.min(STAGE_MAX, Math.round(id)));
}
