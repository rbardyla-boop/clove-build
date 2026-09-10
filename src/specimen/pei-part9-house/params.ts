import { LUMBER, CONCRETE_WALL, FOOTING_T, FOOTING_W, SHEATHING_OSB, SUBFLOOR } from "@/crates/geometry/lumber";

/** Demonstration dimensions. Not implied regulatory minima. */
export const SPECIMEN_ID = "PEI-PART9-DEMO-001";
export const SPECIMEN_VERSION = "0.2.0";
export const PROJECT_DATE = "2026-09-10";

export const P = {
  length: 9.6,
  width: 7.2,
  grade: 0,
  excavDepth: 2.7,
  footingT: FOOTING_T,
  footingW: FOOTING_W,
  fdnT: CONCRETE_WALL,
  fdnAboveGrade: 0.3,
  studOc: 0.406,
  joistOc: 0.406,
  rafterOc: 0.406,
  pitch: 6 / 12,
  overhang: 0.45,
  plate: LUMBER["2x6"].t,
  stud: LUMBER["2x6"],
  joist: LUMBER["2x10"],
  header: LUMBER["2x10"],
  rafter: LUMBER["2x8"],
  ridge: LUMBER["2x10"],
  post: LUMBER["6x6"],
  sheathing: SHEATHING_OSB,
  subfloor: SUBFLOOR,
  wallStudH: 2.362,
} as const;

export const halfL = P.length / 2;
export const halfW = P.width / 2;

export const Y = (() => {
  const excavBottom = P.grade - P.excavDepth;
  const footingTop = excavBottom + P.footingT;
  const fdnTop = P.grade + P.fdnAboveGrade;
  const sillTop = fdnTop + P.plate;
  const joistTop = sillTop + P.joist.d;
  const floorTop = joistTop + P.subfloor;
  const bottomPlateTop = floorTop + P.plate;
  const studTop = bottomPlateTop + P.wallStudH;
  const wallTop = studTop + P.plate * 2;
  const ridgeY = wallTop + halfW * P.pitch;
  return {
    excavBottom,
    footingTop,
    fdnTop,
    sillTop,
    joistTop,
    floorTop,
    bottomPlateTop,
    studTop,
    wallTop,
    ridgeY,
  };
})();

export const ALPHA = Math.atan(P.pitch);
