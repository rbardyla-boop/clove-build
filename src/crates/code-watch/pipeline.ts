/**
 * Future CODE WATCH interface only.
 *
 * OFFICIAL SOURCE → WATCHER → CHANGE DETECTED → HASHED SNAPSHOT
 * → SEMANTIC DIFF → CANDIDATE RULE CHANGE → HUMAN REVIEW
 * → REGRESSION TESTS → SIGNED/VERSIONED RULE PACK
 * → ACTIVATION BY JURISDICTION + DATE
 *
 * A webpage change must never automatically rewrite executable
 * regulatory rules in production.
 */
export type CodeWatchStage =
  | "source"
  | "watch"
  | "changed"
  | "snapshot"
  | "diff"
  | "candidate"
  | "human-review"
  | "regression"
  | "signed-pack"
  | "activation";

export type CodeWatchPipeline = {
  stages: CodeWatchStage[];
};

export const CODE_WATCH_INTERFACE: CodeWatchPipeline = {
  stages: [
    "source",
    "watch",
    "changed",
    "snapshot",
    "diff",
    "candidate",
    "human-review",
    "regression",
    "signed-pack",
    "activation",
  ],
};
