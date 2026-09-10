import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { hashGraph } from "../building-graph/hash.ts";
import { acceptCandidate, futurePlanIngestAdapter } from "../ingest/adapter.ts";
import { createSnapshot } from "../session/apply.ts";
import { visibleIds } from "../construction-sequence/visibility.ts";
import { STAGE_MAX } from "../construction-sequence/stages.ts";
import {
  EVIDENCE_STATUSES,
  futureRealityCaptureAdapter,
  plannedOnly,
  type ObservedBuildingState,
} from "./adapter.ts";

const RULE_VERDICTS = ["PASS", "FAIL", "MISSING_INFORMATION", "UNCERTAIN"] as const;

describe("v2 seams remain unimplemented and non-destructive", () => {
  const graph = buildPeiHouse();

  it("component ids are semantic, not mesh indices", () => {
    const ids = Object.keys(graph.components);
    assert.ok(ids.length > 80);
    assert.ok(ids.every((id) => !/^mesh\d+$/i.test(id)));
    assert.ok(ids.some((id) => id.includes("stud")));
    assert.ok(ids.some((id) => id.includes("header")));
    assert.ok(ids.some((id) => id.includes("joist")));
    assert.ok(ids.some((id) => id.includes("foundation")));
  });

  it("BuildingComponent has no observation fields; provenance is claim authority", () => {
    const sample = Object.values(graph.components)[0]!;
    assert.equal("observations" in sample, false);
    assert.equal("evidence" in sample, false);
    assert.equal("observed" in sample, false);
    assert.ok(sample.provenance.status);
    assert.ok(["verified", "provisional", "demo-only", "not-evaluated"].includes(sample.provenance.status));
  });

  it("observations compose beside the plan and do not change its hash", () => {
    const before = hashGraph(graph);
    const firstId = Object.keys(graph.components)[0]!;
    const state: ObservedBuildingState = {
      plannedGraph: graph,
      observations: [
        {
          sourceId: "ryan-jobsite-video-017",
          timestamp: "2026-08-17T14:32:18.000Z",
          componentId: firstId,
          status: "DIRECTLY_OBSERVED",
          confidence: 0.94,
        },
        {
          sourceId: "ryan-jobsite-video-017",
          timestamp: "2026-08-17T14:32:18.000Z",
          status: "OCCLUDED",
        },
      ],
    };
    assert.equal(hashGraph(state.plannedGraph), before);
    assert.equal(hashGraph(graph), before);
    assert.equal(state.plannedGraph, graph);
    assert.equal(state.observations.length, 2);
  });

  it("v1 plannedOnly is an empty evidence layer on the specimen", () => {
    const state = plannedOnly(graph);
    assert.equal(state.plannedGraph, graph);
    assert.deepEqual(state.observations, []);
    assert.equal(hashGraph(state.plannedGraph), hashGraph(graph));
  });

  it("evidence vocabulary is evidence-bounded, not compliance", () => {
    const allowed = new Set<string>(EVIDENCE_STATUSES);
    for (const banned of ["COMPLIANT", "AI_ACCURATE", "PASS", "FAIL", "APPROVED", "SAFE"]) {
      assert.equal(allowed.has(banned), false);
    }
    for (const verdict of RULE_VERDICTS) {
      assert.equal(allowed.has(verdict), false);
    }
    assert.ok(allowed.has("UNKNOWN"));
    assert.ok(allowed.has("OCCLUDED"));
    assert.ok(allowed.has("AI_INFERRED"));
    assert.ok(allowed.has("CONFLICTING"));
  });

  it("a sound specimen candidate is accepted; a broken one is not", () => {
    const accepted = acceptCandidate({ graph, sourceKind: "specimen", sourceId: graph.id });
    assert.equal(accepted, graph);
    const broken = { ...graph, rootIds: ["missing-root"] };
    assert.throws(() => acceptCandidate({ graph: broken, sourceKind: "unknown" }), /integrity/);
  });

  it("future adapters fail closed", async () => {
    await assert.rejects(() => futurePlanIngestAdapter.ingest({}), /not implemented/);
    await assert.rejects(
      () => futureRealityCaptureAdapter.reconstruct({ id: "cap-0", assets: [] }),
      /not implemented/,
    );
  });

  it("v1 session holds the planned specimen, not observed state", () => {
    const snap = createSnapshot(graph);
    assert.equal("observations" in snap, false);
    assert.equal(snap.graph.id, "PEI-PART9-DEMO-001");
    assert.equal(snap.graph, graph);
    assert.equal(snap.constructionStage, STAGE_MAX);
  });

  it("construction visibility is the planned sequence, not site evidence", () => {
    const ids = visibleIds(graph, STAGE_MAX, new Set());
    assert.ok(ids.length > 0);
    assert.ok(ids.every((id) => graph.components[id]));
  });
});
