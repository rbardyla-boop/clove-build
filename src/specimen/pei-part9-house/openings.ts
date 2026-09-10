/** Shared opening layout of THIS specimen. Not a code-prescribed window schedule. */
export type SpecimenOpening = {
  id: string;
  wall: "front" | "back" | "left" | "right";
  kind: "window" | "door";
  s: number;
  w: number;
  h: number;
  sill: number;
  challenge?: boolean;
};

export const SPECIMEN_OPENINGS: SpecimenOpening[] = [
  { id: "D1", wall: "front", kind: "door", s: -2.55, w: 0.86, h: 2.03, sill: 0 },
  { id: "W1", wall: "front", kind: "window", s: 0.2, w: 1.22, h: 1.2, sill: 0.9, challenge: true },
  { id: "W2", wall: "front", kind: "window", s: 2.75, w: 1.22, h: 1.2, sill: 0.9 },
  { id: "W3", wall: "back", kind: "window", s: 0.15, w: 1.47, h: 1.2, sill: 0.9 },
  { id: "W4", wall: "left", kind: "window", s: 0.4, w: 1.02, h: 1.2, sill: 0.9 },
  { id: "W5", wall: "right", kind: "window", s: -0.9, w: 1.02, h: 1.2, sill: 0.9 },
];

export function openingsOn(wall: SpecimenOpening["wall"]): SpecimenOpening[] {
  return SPECIMEN_OPENINGS.filter((o) => o.wall === wall);
}
