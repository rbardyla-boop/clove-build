import type { BuildingComponent, ComponentType } from "@/crates/building-graph/types";

/**
 * What a component *is* in space. Derived from type — not explode groups,
 * not display layers. Sheets occupy a face; openings occupy a hole in a face;
 * vessels occupy a water volume. Geometry that ignores this is a spatial defect.
 */
export type OccupancyRole =
  | "site"
  | "solid"
  | "sheet"
  | "opening"
  | "service"
  | "vessel"
  | "equipment"
  | "finish"
  | "assembly"
  | "ignore";

const ROLE: { [K in ComponentType]: OccupancyRole } = {
  site: "site",
  excavation: "site",
  footing: "solid",
  "foundation-wall": "solid",
  "pad-footing": "solid",
  column: "solid",
  beam: "solid",
  "sill-plate": "solid",
  "rim-joist": "solid",
  "floor-joist": "solid",
  subfloor: "solid",
  "bottom-plate": "solid",
  "top-plate": "solid",
  "king-stud": "solid",
  "jack-stud": "solid",
  "common-stud": "solid",
  "cripple-stud": "solid",
  header: "solid",
  "rough-sill": "solid",
  "wall-sheathing": "sheet",
  rafter: "solid",
  ridge: "solid",
  "roof-sheathing": "sheet",
  "gable-stud": "solid",
  "collar-tie": "solid",
  "ceiling-joist": "solid",
  "temporary-brace": "solid",
  assembly: "assembly",
  slab: "solid",
  "interior-partition": "solid",
  "window-unit": "opening",
  "door-unit": "opening",
  flashing: "sheet",
  wrb: "sheet",
  underlayment: "sheet",
  cladding: "sheet",
  "roof-covering": "sheet",
  rainscreen: "sheet",
  "pipe-supply": "service",
  "pipe-dwv": "service",
  "pipe-vent": "service",
  fitting: "service",
  fixture: "equipment",
  trap: "service",
  "water-heater": "equipment",
  panel: "equipment",
  breaker: "equipment",
  cable: "service",
  "device-box": "equipment",
  receptacle: "equipment",
  switch: "equipment",
  luminaire: "equipment",
  "service-entry": "service",
  bonding: "service",
  "heat-pump-indoor": "equipment",
  "heat-pump-outdoor": "equipment",
  duct: "service",
  terminal: "equipment",
  exhaust: "service",
  hrv: "equipment",
  "refrigerant-line": "service",
  condensate: "service",
  insulation: "sheet",
  "air-barrier": "sheet",
  "vapour-barrier": "sheet",
  drywall: "sheet",
  trim: "finish",
  "floor-finish": "finish",
  paint: "finish",
  penetration: "ignore",
  gasket: "ignore",
  anchor: "ignore",
  hanger: "ignore",
  "fastener-group": "ignore",
  fascia: "solid",
  deck: "solid",
  pool: "vessel",
  "hot-tub": "vessel",
  "equipment-pad": "solid",
  "compacted-base": "site",
  pump: "equipment",
  filter: "equipment",
  disconnect: "equipment",
  "water-volume": "vessel",
  barrier: "solid",
};

export function occupancyRole(type: ComponentType): OccupancyRole {
  return ROLE[type];
}

export function ofRole(c: BuildingComponent, role: OccupancyRole): boolean {
  return occupancyRole(c.type) === role;
}

/** Envelope face sheets that must be cut at doors and windows. */
export function isEnvelopeFaceSheet(c: BuildingComponent): boolean {
  return c.type === "wrb" || c.type === "cladding" || c.type === "rainscreen";
}

export function isOpening(c: BuildingComponent): boolean {
  return occupancyRole(c.type) === "opening";
}

export function isVessel(c: BuildingComponent): boolean {
  return occupancyRole(c.type) === "vessel";
}

/** Distinct water-feature families must not share occupancy. */
export function vesselFamily(c: BuildingComponent): "pool" | "spa" | null {
  if (!isVessel(c)) return null;
  if (c.type === "hot-tub" || c.id.startsWith("hottub.") || c.tags?.includes("hot-tub")) return "spa";
  return "pool";
}
