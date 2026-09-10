export type Vec3 = [number, number, number];

export type TradeId =
  | "foundation"
  | "structure"
  | "envelope"
  | "plumbing"
  | "electrical"
  | "hvac"
  | "thermal"
  | "finish";

export type ComponentType =
  | "site"
  | "excavation"
  | "footing"
  | "foundation-wall"
  | "pad-footing"
  | "column"
  | "beam"
  | "sill-plate"
  | "rim-joist"
  | "floor-joist"
  | "subfloor"
  | "bottom-plate"
  | "top-plate"
  | "king-stud"
  | "jack-stud"
  | "common-stud"
  | "cripple-stud"
  | "header"
  | "rough-sill"
  | "wall-sheathing"
  | "rafter"
  | "ridge"
  | "roof-sheathing"
  | "gable-stud"
  | "collar-tie"
  | "ceiling-joist"
  | "temporary-brace"
  | "assembly"
  | "slab"
  | "interior-partition"
  | "window-unit"
  | "door-unit"
  | "flashing"
  | "wrb"
  | "underlayment"
  | "cladding"
  | "roof-covering"
  | "rainscreen"
  | "pipe-supply"
  | "pipe-dwv"
  | "pipe-vent"
  | "fitting"
  | "fixture"
  | "trap"
  | "water-heater"
  | "panel"
  | "breaker"
  | "cable"
  | "device-box"
  | "receptacle"
  | "switch"
  | "luminaire"
  | "service-entry"
  | "bonding"
  | "heat-pump-indoor"
  | "heat-pump-outdoor"
  | "duct"
  | "terminal"
  | "exhaust"
  | "hrv"
  | "refrigerant-line"
  | "condensate"
  | "insulation"
  | "air-barrier"
  | "vapour-barrier"
  | "drywall"
  | "trim"
  | "floor-finish"
  | "paint"
  | "penetration"
  | "gasket"
  | "anchor"
  | "hanger"
  | "fastener-group"
  | "fascia"
  | "deck"
  | "pool"
  | "hot-tub"
  | "equipment-pad";

export type GeometryDescriptor = {
  kind: "box" | "group";
  center: Vec3;
  size: Vec3;
  rotation?: Vec3;
};

export type MaterialDescriptor = {
  id: string;
  label: string;
  family:
    | "soil"
    | "concrete"
    | "wood"
    | "wood-treated"
    | "sheathing"
    | "context"
    | "metal"
    | "copper"
    | "plastic"
    | "insulation"
    | "gypsum"
    | "membrane"
    | "cladding"
    | "roofing"
    | "paint"
    | "cable";
};

export type AuthorityCategory =
  | "OFFICIAL_REGULATION"
  | "OFFICIAL_GUIDANCE"
  | "STANDARD_REFERENCE"
  | "VERIFIED_ENGINEERING_RELATION"
  | "BUILDING_SCIENCE"
  | "TRADE_PRACTICE"
  | "PROJECT_MODEL_ASSUMPTION"
  | "EDUCATIONAL_DEMO_RULE"
  | "INFERENCE"
  | "AI_INFERRED"
  | "UNKNOWN";

export type ProvenanceStatus =
  | "verified"
  | "provisional"
  | "demo-only"
  | "not-evaluated";

export type ClaimCategory =
  | "required-by-code"
  | "permitted-by-code"
  | "trade-practice"
  | "manufacturer-dependent"
  | "engineer-designed"
  | "jurisdiction-specific"
  | "common-method"
  | "educational-simplification"
  | "building-science-principle";

export type PenetrationRef = {
  hostId: string;
  tradeComponentId: string;
  purpose: string;
  shape?: "circle" | "rect";
  axis?: "x" | "y" | "z";
  diameter?: number;
  width?: number;
  height?: number;
  depth?: number;
  authorityClass?: AuthorityCategory;
  joistType?: string;
  distanceFromEdgesMm?: [number, number];
  distanceFromEndMm?: number;
  protectionState?: "none" | "plate" | "bushing" | "unknown";
};

export type RelationKind =
  | "contained-in"
  | "supported-by"
  | "aligned-with"
  | "offset-from"
  | "spaced-from"
  | "centred-in"
  | "penetrates"
  | "attached-to"
  | "above"
  | "below"
  | "parallel"
  | "perpendicular"
  | "clearance-between";

export type Relation = {
  id: string;
  kind: RelationKind;
  a: string;
  b: string;
  axis?: 0 | 1 | 2;
  value?: number;
  authorityClass: AuthorityCategory;
};

export type Attachment = {
  id: string;
  hostId: string;
  attachedId: string;
  kind: string;
  count?: number;
  spacing?: number;
  positions?: Vec3[];
  verified: boolean;
  authorityClass: AuthorityCategory;
};

/** Derived or declared site envelope. Engines must read this, not specimen params. */
export type SiteFacts = {
  constructionType: "basement" | "slab-on-grade" | "crawlspace";
  xMin: number;
  xMax: number;
  zMin: number;
  zMax: number;
  floorTop: number;
  wallTop: number;
  sillTop: number;
  grade: number;
  ridgeY: number;
  joistDepth: number;
};

/** Axis endpoints of a modelled service run. Flow travels from `from` toward `to`. */
export type LinearRun = {
  from: Vec3;
  to: Vec3;
  flow: "from-to";
  horizontalRun?: number;
  verticalFall?: number;
  calculatedSlope?: number;
  designSlope?: number;
  designSlopeSource?: string;
  authorityClass?: AuthorityCategory;
};

export type BuildingComponent = {
  id: string;
  type: ComponentType;
  label: string;
  parentId?: string;
  childIds: string[];
  trade?: TradeId;
  geometry: GeometryDescriptor;
  material: MaterialDescriptor;
  assembly: {
    /** Planned construction sequence stage, not observed percent-complete. */
    stage: number;
    untilStage?: number;
    /** Planned prerequisites. Not proof that those members were observed. */
    dependencies: string[];
    explodeGroup: string;
    explodeVector: Vec3;
    localExplodeVector: Vec3;
    /** Extra offset used only when explode scope is trade:<id>. Never applied to whole-house explode. */
    tradeExplodeVector?: Vec3;
  };
  structural?: {
    loadPathRole?: string;
    supportedBy?: string[];
    supports?: string[];
    required?: boolean;
  };
  system?: {
    systemId?: string;
    nodeId?: string;
    role?: string;
  };
  /** Endpoint geometry for linear services. Bounding boxes are not slope evidence. */
  run?: LinearRun;
  penetration?: PenetrationRef;
  learning: {
    shortDescription: string;
    purpose: string;
    failureModes?: string[];
    claimCategory?: ClaimCategory;
    visualization?: string;
  };
  /**
   * Claim authority for this modelled member (verified / demo-only / …).
   * Not jobsite observation — that lives on EvidenceRecord.
   */
  provenance: {
    jurisdiction?: string;
    ruleIds?: string[];
    status: ProvenanceStatus;
    authority?: AuthorityCategory;
  };
  tags?: string[];
  selectable?: boolean;
};

export type SystemNode = {
  id: string;
  componentId: string;
  kind: string;
  label: string;
};

export type SystemConnection = {
  id: string;
  from: string;
  to: string;
  kind: "supply" | "return" | "drain" | "vent" | "hot" | "cold" | "circuit" | "air-supply" | "air-return" | "exhaust" | "bonding" | "refrigerant" | "condensate";
};

export type SystemGraph = {
  id: string;
  trade: "plumbing" | "electrical" | "hvac";
  nodes: SystemNode[];
  connections: SystemConnection[];
};

/**
 * Canonical planned semantic model.
 * Members keep stable semantic ids (assembly.wall.front.stud.00), not mesh indices.
 * Site observation does not live here; compose EvidenceRecord beside this graph.
 */
export type BuildingGraph = {
  id: string;
  version: string;
  title: string;
  jurisdictionId: string;
  projectDate: string;
  components: Record<string, BuildingComponent>;
  rootIds: string[];
  assemblies: string[];
  systems: SystemGraph[];
  site?: SiteFacts;
  relations?: Relation[];
  attachments?: Attachment[];
};
