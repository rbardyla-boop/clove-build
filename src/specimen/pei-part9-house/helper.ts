import type { ComponentType, LinearRun, MaterialDescriptor, TradeId, Vec3 } from "@/crates/building-graph/types";
import type { Draft, Registry } from "./registry";
import { MAT, PROV_EDU, PROV_MODEL, PROV_SCIENCE } from "./materials";

export const learn = (short: string, purpose: string, failureModes: string[] = [], claimCategory: Draft["learning"]["claimCategory"] = "educational-simplification") => ({
  shortDescription: short,
  purpose,
  failureModes,
  claimCategory,
});

export function midpoint(a: Vec3, b: Vec3): Vec3 {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
}

/** Axis-aligned segment as a box. */
export function segmentBox(a: Vec3, b: Vec3, dia: number): { center: Vec3; size: Vec3 } {
  const dx = Math.abs(b[0] - a[0]);
  const dy = Math.abs(b[1] - a[1]);
  const dz = Math.abs(b[2] - a[2]);
  const center = midpoint(a, b);
  return {
    center,
    size: [Math.max(dx, dia), Math.max(dy, dia), Math.max(dz, dia)],
  };
}

export function addBox(
  reg: Registry,
  opts: {
    id: string;
    type: ComponentType;
    label: string;
    parentId?: string;
    trade: TradeId;
    center: Vec3;
    size: Vec3;
    rotation?: Vec3;
    material: MaterialDescriptor;
    stage: number;
    untilStage?: number;
    dependencies?: string[];
    explodeGroup: string;
    explodeVector: Vec3;
    localExplodeVector?: Vec3;
    tradeExplodeVector?: Vec3;
    tags?: string[];
    short: string;
    purpose: string;
    visualization?: string;
    system?: Draft["system"];
    run?: LinearRun;
    penetration?: Draft["penetration"];
    provenance?: Draft["provenance"];
    structural?: Draft["structural"];
  },
) {
  return reg.add({
    id: opts.id,
    type: opts.type,
    label: opts.label,
    parentId: opts.parentId,
    trade: opts.trade,
    geometry: { kind: "box", center: opts.center, size: opts.size, rotation: opts.rotation },
    material: opts.material,
    assembly: {
      stage: opts.stage,
      untilStage: opts.untilStage,
      dependencies: opts.dependencies ?? [],
      explodeGroup: opts.explodeGroup,
      explodeVector: opts.explodeVector,
      localExplodeVector: opts.localExplodeVector ?? opts.explodeVector,
      tradeExplodeVector: opts.tradeExplodeVector,
    },
    structural: opts.structural,
    system: opts.system,
    run: opts.run,
    penetration: opts.penetration,
    learning: {
      ...learn(opts.short, opts.purpose),
      visualization: opts.visualization,
    },
    provenance: opts.provenance ?? PROV_MODEL,
    tags: opts.tags,
  });
}

export function addAssembly(
  reg: Registry,
  opts: {
    id: string;
    label: string;
    trade: TradeId;
    center: Vec3;
    size: Vec3;
    stage: number;
    dependencies?: string[];
    explodeGroup?: string;
    explodeVector?: Vec3;
    short: string;
    purpose: string;
    tags?: string[];
  },
) {
  return reg.add({
    id: opts.id,
    type: "assembly",
    label: opts.label,
    trade: opts.trade,
    geometry: { kind: "group", center: opts.center, size: opts.size },
    material: MAT.wood,
    assembly: {
      stage: opts.stage,
      dependencies: opts.dependencies ?? [],
      explodeGroup: opts.explodeGroup ?? opts.id,
      explodeVector: opts.explodeVector ?? [0, 0, 0],
      localExplodeVector: [0, 0, 0],
    },
    learning: learn(opts.short, opts.purpose),
    provenance: PROV_MODEL,
    tags: opts.tags,
  });
}

export { MAT, PROV_EDU, PROV_MODEL, PROV_SCIENCE };
