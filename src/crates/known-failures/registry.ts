/** Open defects already seen. Do not re-report these as new feedback. */

export type FeedbackBucket =
  | "physical-construction"
  | "regulatory-authority"
  | "usability-teaching"
  | "visual-modeling";

export type KnownFailureStatus = "OPEN" | "REPAIRED";

export type KnownFailure = {
  id: string;
  title: string;
  bucket: FeedbackBucket;
  status: KnownFailureStatus;
  specimens: readonly string[];
  summary: string;
  detector: string;
};

export const KNOWN_FAILURES: readonly KnownFailure[] = [
  {
    id: "ENVELOPE-OPENING-001",
    title: "Envelope layer covers door and window openings",
    bucket: "visual-modeling",
    status: "OPEN",
    specimens: ["PEI-PART9-DEMO-001", "PEI-SLAB-COTTAGE-001", "PEI-RURAL-POOL-001"],
    summary:
      "WRB and cladding are full-wall sheets. They occupy the door/window volume instead of being cut around the framed opening. Recorded 2026-09-10. Do not treat as new feedback.",
    detector: "findEnvelopeOpeningIssues",
  },
  {
    id: "POOL-SPA-001",
    title: "Pool and hot-tub geometry intersect or occupy the same space",
    bucket: "visual-modeling",
    status: "OPEN",
    specimens: ["PEI-RURAL-POOL-001"],
    summary:
      "The in-ground pool vessel/water and the deck hot tub occupy overlapping or colliding volume. Recorded 2026-09-10. Do not treat as new feedback.",
    detector: "findPoolSpaIssues",
  },
];

export function openFailuresFor(graphId: string): KnownFailure[] {
  return KNOWN_FAILURES.filter((f) => f.status === "OPEN" && f.specimens.includes(graphId));
}
