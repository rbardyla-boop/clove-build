import { checkGraphIntegrity } from "@/crates/building-graph/integrity";
import { hashGraph } from "@/crates/building-graph/hash";
import { explodeOffset } from "@/crates/explode/engine";
import { STAGE_MAX } from "@/crates/construction-sequence/stages";
import type { BuildingGraph } from "@/crates/building-graph/types";
import type { LabSnapshot } from "@/crates/session/apply";
import lastRun from "./last-run.json";

type Counts = { passed: number; failed: number };
type Gate = "PASS" | "FAIL" | "NOT YET RUN";

export type Receipt = {
  specimen: string;
  version: string;
  graphIntegrity: "PASS" | "FAIL";
  explodeInvariant: "PASS" | "FAIL";
  sequenceInvariant: "PASS" | "FAIL";
  resetInvariant: "PASS" | "FAIL";
  ruleDeterminism: "PASS" | "FAIL";
  cloveCore: Counts;
  fullRepository: Counts;
  typecheck: Gate;
  productionBuild: Gate;
  githubCi: Gate;
  browserVerification: string;
  ryanHumanTest: Gate;
  automated: { passed: number; failed: number; ranAt: string };
  regulatoryPack: string;
  knownLimitations: string[];
  graphHash: string;
  componentCount: number;
};

function counts(value: unknown, fallback: Counts): Counts {
  if (value && typeof value === "object" && "passed" in value && "failed" in value) {
    const v = value as { passed: unknown; failed: unknown };
    if (typeof v.passed === "number" && typeof v.failed === "number") return { passed: v.passed, failed: v.failed };
  }
  return fallback;
}

function gate(value: unknown): Gate {
  if (value === "PASS" || value === "FAIL" || value === "NOT YET RUN") return value;
  return "NOT YET RUN";
}

export function liveReceipt(graph: BuildingGraph, snapshot: LabSnapshot): Receipt {
  const issues = checkGraphIntegrity(graph);
  const sample = Object.values(graph.components).find((c) => c.geometry.kind === "box")!;
  const z = explodeOffset(graph, sample, 0, "whole");
  const a = explodeOffset(graph, sample, 1, "whole");
  const b = explodeOffset(graph, sample, 0, "whole");
  const c = explodeOffset(graph, sample, 1, "whole");
  const explodeOk =
    z.every((n) => n === 0) &&
    b.every((n) => n === 0) &&
    a[0] === c[0] &&
    a[1] === c[1] &&
    a[2] === c[2];
  const seqOk = Object.values(graph.components).every((comp) => comp.assembly.stage >= 1 && comp.assembly.stage <= STAGE_MAX);
  const resetOk = snapshot.removedIds.length === 0 && snapshot.explodeAmount === 0;
  const cloveCore = counts(lastRun.cloveCore, { passed: lastRun.passed ?? 0, failed: lastRun.failed ?? 0 });
  const fullRepository = counts(lastRun.fullRepository, { passed: 0, failed: 0 });

  return {
    specimen: graph.id,
    version: graph.version,
    graphIntegrity: issues.length === 0 ? "PASS" : "FAIL",
    explodeInvariant: explodeOk ? "PASS" : "FAIL",
    sequenceInvariant: seqOk ? "PASS" : "FAIL",
    resetInvariant: resetOk ? "PASS" : "FAIL",
    ruleDeterminism: lastRun.ruleDeterminism === "PASS" ? "PASS" : "FAIL",
    cloveCore,
    fullRepository,
    typecheck: gate(lastRun.typecheck),
    productionBuild: gate(lastRun.productionBuild),
    githubCi: gate(lastRun.githubCi),
    browserVerification: lastRun.browserVerification,
    ryanHumanTest: gate(lastRun.ryanHumanTest),
    automated: {
      passed: cloveCore.passed,
      failed: cloveCore.failed,
      ranAt: lastRun.ranAt,
    },
    regulatoryPack: "PROTOTYPE / PARTIALLY VERIFIED",
    knownLimitations: [
      "No finite-element structural analysis.",
      "NBC provision text is not reproduced; most construction rules are educational demo rules.",
      "PEI adoption of NBC 2025 is unverified as of 2026-09-10.",
      "Break It mutations reset on reload; Ryan Test marks persist locally.",
      "Desktop is the acceptance target; mobile is usable but not the design center.",
      "A green Clove subset is not the full repository gate.",
      "A green repository is not a passed Ryan Test.",
    ],
    graphHash: hashGraph(graph),
    componentCount: Object.keys(graph.components).length,
  };
}
