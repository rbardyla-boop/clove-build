export type Vec3 = [number, number, number];

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
  | "assembly";

export type GeometryDescriptor = {
  kind: "box" | "group";
  center: Vec3;
  size: Vec3;
  rotation?: Vec3;
};

export type MaterialDescriptor = {
  id: string;
  label: string;
  family: "soil" | "concrete" | "wood" | "wood-treated" | "sheathing" | "context";
};

export type AuthorityCategory =
  | "OFFICIAL_REGULATION"
  | "OFFICIAL_GUIDANCE"
  | "STANDARD_REFERENCE"
  | "VERIFIED_ENGINEERING_RELATION"
  | "PROJECT_MODEL_ASSUMPTION"
  | "EDUCATIONAL_DEMO_RULE"
  | "INFERENCE"
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
  | "educational-simplification";

export type BuildingComponent = {
  id: string;
  type: ComponentType;
  label: string;
  parentId?: string;
  childIds: string[];
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
  };
  structural?: {
    loadPathRole?: string;
    supportedBy?: string[];
    supports?: string[];
    required?: boolean;
  };
  learning: {
    shortDescription: string;
    purpose: string;
    failureModes?: string[];
    claimCategory?: ClaimCategory;
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
};
