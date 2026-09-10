export const SPACE_ZONES = [
  "OCCUPIED_ROOM",
  "WALL_CAVITY",
  "FLOOR_CAVITY",
  "CEILING_CAVITY",
  "ATTIC",
  "UNDER_FLOOR",
  "CHASE",
  "SOFFIT",
  "SHAFT",
  "MECHANICAL_SPACE",
  "BELOW_GRADE",
  "EXTERIOR",
  "SERVICE_ENTRY",
  "ROOF_SPACE",
] as const;

export type SpaceZoneId = (typeof SPACE_ZONES)[number];

export const SERVICE_ALLOWED_ZONES: ReadonlySet<SpaceZoneId> = new Set([
  "WALL_CAVITY",
  "FLOOR_CAVITY",
  "CEILING_CAVITY",
  "ATTIC",
  "UNDER_FLOOR",
  "CHASE",
  "SHAFT",
  "MECHANICAL_SPACE",
  "BELOW_GRADE",
  "SERVICE_ENTRY",
  "EXTERIOR",
  "ROOF_SPACE",
  "SOFFIT",
]);

export function zoneAllowsExposedService(zone: SpaceZoneId): boolean {
  return zone === "MECHANICAL_SPACE" || zone === "EXTERIOR" || zone === "SERVICE_ENTRY" || zone === "BELOW_GRADE";
}
