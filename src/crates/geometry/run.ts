import type { BuildingComponent, LinearRun, Vec3 } from "@/crates/building-graph/types";

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
  return { from, to, flow: "from-to" };
}

export type DwvRunClass =
  | "not-dwv"
  | "short-or-vertical"
  | "unmodelled"
  | "level"
  | "sloped";

export type DwvRunEval = {
  kind: DwvRunClass;
  horiz: number;
  length: number;
  fall: number | null;
  startElevation: number | null;
  endElevation: number | null;
};

const LEVEL_M = 0.001;
const MIN_HORIZ_M = 0.5;

/**
 * Classify a DWV member from endpoint elevations and flow direction.
 * Bounding-box size is not evidence of fall.
 */
export function classifyDwvRun(c: BuildingComponent): DwvRunEval {
  if (c.type !== "pipe-dwv") {
    return { kind: "not-dwv", horiz: 0, length: 0, fall: null, startElevation: null, endElevation: null };
  }
  const run = c.run;
  if (!run) {
    return { kind: "unmodelled", horiz: 0, length: 0, fall: null, startElevation: null, endElevation: null };
  }
  const horiz = runHoriz(run);
  const length = runLength(run);
  const fall = runFall(run);
  const startElevation = run.from[1];
  const endElevation = run.to[1];
  if (horiz < MIN_HORIZ_M) {
    return { kind: "short-or-vertical", horiz, length, fall, startElevation, endElevation };
  }
  if (Math.abs(fall) < LEVEL_M) {
    return { kind: "level", horiz, length, fall, startElevation, endElevation };
  }
  return { kind: "sloped", horiz, length, fall, startElevation, endElevation };
}
