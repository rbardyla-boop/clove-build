import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { hashGraph } from "../building-graph/hash.ts";
import { applyCommand, createSnapshot, type LabSnapshot } from "./apply.ts";
import type { Command } from "./commands.ts";
import { TRADE_IDS } from "../trades/infer.ts";

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function fingerprint(s: LabSnapshot) {
  return JSON.stringify({
    selectedId: s.selectedId,
    explodeAmount: s.explodeAmount,
    explodeScope: s.explodeScope,
    constructionStage: s.constructionStage,
    removedIds: s.removedIds,
    hiddenIds: s.hiddenIds,
    isolatedIds: s.isolatedIds,
    mode: s.mode,
    xray: s.xray,
    tradeLayers: s.tradeLayers,
    flowMode: s.flowMode,
    hideFinish: s.hideFinish,
    trace: s.trace,
    check: s.check?.map((r) => r.ruleId) ?? null,
    faultIds: s.faultIds,
    searchQuery: s.searchQuery,
    viewDepth: s.viewDepth,
    lessonId: s.lessonId,
  });
}

describe("chaos gauntlet", () => {
  const graph = buildPeiHouse();
  const boxes = Object.values(graph.components).filter((c) => c.geometry.kind === "box").map((c) => c.id);
  const baseline = fingerprint(createSnapshot(graph));
  const baselineHash = hashGraph(graph);

  it("reset restores baseline after randomized interaction sequences", () => {
    const seeds = [1, 7, 13, 29, 42, 99, 128, 256, 777, 2026];
    for (const seed of seeds) {
      const rng = mulberry32(seed);
      let s = createSnapshot(graph);
      const n = 18 + Math.floor(rng() * 12);
      for (let i = 0; i < n; i++) {
        const kind = Math.floor(rng() * 11);
        const id = pick(rng, boxes);
        let cmd: Command;
        switch (kind) {
          case 0:
            cmd = { type: "SELECT_COMPONENT", id };
            break;
          case 1:
            cmd = { type: "SET_EXPLODE", amount: rng() };
            break;
          case 2:
            cmd = { type: "SET_EXPLODE_SCOPE", scope: rng() > 0.5 ? "whole" : "assembly.wall.front" };
            break;
          case 3:
            cmd = { type: "SET_TRADE_LAYER", trade: pick(rng, TRADE_IDS), state: pick(rng, ["on", "off", "ghost"] as const) };
            break;
          case 4:
            cmd = { type: "TRACE_FROM", id };
            break;
          case 5:
            cmd = { type: "SET_CONSTRUCTION_STAGE", stage: 1 + Math.floor(rng() * 23) };
            break;
          case 6:
            cmd = { type: "SET_MODE", mode: "break-it" };
            break;
          case 7:
            cmd = { type: "REMOVE_COMPONENT", id };
            break;
          case 8:
            cmd = { type: "RESTORE_COMPONENT", id };
            break;
          case 9:
            cmd = { type: "RUN_CHECK" };
            break;
          default:
            cmd = { type: "SET_XRAY", enabled: rng() > 0.5 };
        }
        s = applyCommand(s, cmd);
      }
      s = applyCommand(s, { type: "RESET_SPECIMEN" });
      assert.equal(fingerprint(s), baseline, `seed ${seed}`);
      assert.equal(hashGraph(s.graph), baselineHash, `seed ${seed} hash`);
    }
  });
});
