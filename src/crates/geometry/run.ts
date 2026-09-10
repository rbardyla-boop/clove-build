import type { AuthorityCategory, BuildingComponent, LinearRun, Vec3 } from "@/crates/building-graph/types";

export function runLength(run: LinearRun): number {
  return Math.hypot(run.to[0] - run.from[0], run.to[1] - run.from[1], run.to[2] - run.from[2]);
}

export function runHoriz(run: LinearRun): number {
  return Math.hypot(run.to[0] - run.from[0], run.to[2] - run.from[2]);
}

export function runFall(run: LinearRun): number {
  return run.from[1] - run.to[1];
}

export function linearRun(from: Vec3, to: Vec3): LinearRun {
  const horiz = Math.hypot(to[0] - from[0], to[2] - from[2]);
  const fall = from[1] - to[1];
  return {
    from,
    to,
    flow: "from-to",
    horizontalRun: horiz,
    verticalFall: fall,
    calculatedSlope: horiz > 1e-6 ? fall / horiz : 0,
  };
}

/** Project-model 1:50 fall. Not an NPC determination. */
export const DESIGN_SLOPE_1_IN_50 = 0.02;

export function slopedDrain(
  from: Vec3,
  toXZ: Vec3,
  designSlope = DESIGN_SLOPE_1_IN_50,
): LinearRun {
  const horiz = Math.hypot(toXZ[0] - from[0], toXZ[2] - from[2]);
  const fall = horiz * designSlope;
  const to: Vec3 = [toXZ[0], from[1] - fall, toXZ[2]];
  return {
    from,
    to,
    flow: "from-to",
    horizontalRun: horiz,
    verticalFall: fall,
    calculatedSlope: designSlope,
    designSlope,
    designSlopeSource: "project-model-assumption 1:50",
    authorityClass: "PROJECT_MODEL_ASSUMPTION" as AuthorityCategory,
  };
}

export type DwvRunClass =
  | "not-dwv"
  | "short-or-vertical"
  | "unmodelled"
  | "level"
  | "sloped"
  | "reverse-grade";

export type DwvRunEval = {
  kind: DwvRunClass;
  horiz: number;
  length: number;
  fall: number | null;
  startElevation: number | null;
  endElevation: number | null;
  calculatedSlope: number | null;
};

const LEVEL_M = 0.001;
const MIN_HORIZ_M = 0.5;

/**
 * Classify a DWV member from endpoint elevations and flow direction.
 * Bounding-box size is not evidence of fall.
 */
export function classifyDwvRun(c: BuildingComponent): DwvRunEval {
  if (c.type !== "pipe-dwv") {
    return {
      kind: "not-dwv",
      horiz: 0,
      length: 0,
      fall: null,
      startElevation: null,
      endElevation: null,
      calculatedSlope: null,
    };
  }
  const run = c.run;
  if (!run) {
    return {
      kind: "unmodelled",
      horiz: 0,
      length: 0,
      fall: null,
      startElevation: null,
      endElevation: null,
      calculatedSlope: null,
    };
  }
  const horiz = runHoriz(run);
  const length = runLength(run);
  const fall = runFall(run);
  const startElevation = run.from[1];
  const endElevation = run.to[1];
  const calculatedSlope = horiz > 1e-6 ? fall / horiz : 0;
  if (horiz < MIN_HORIZ_M) {
    return { kind: "short-or-vertical", horiz, length, fall, startElevation, endElevation, calculatedSlope };
  }
  if (Math.abs(fall) < LEVEL_M) {
    return { kind: "level", horiz, length, fall, startElevation, endElevation, calculatedSlope };
  }
  if (fall < 0) {
    return { kind: "reverse-grade", horiz, length, fall, startElevation, endElevation, calculatedSlope };
  }
  return { kind: "sloped", horiz, length, fall, startElevation, endElevation, calculatedSlope };
}

