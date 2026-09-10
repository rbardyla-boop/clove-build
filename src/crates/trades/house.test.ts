import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { hashGraph } from "../building-graph/hash.ts";
import { checkGraphIntegrity } from "../building-graph/integrity.ts";
import { explodeOffset, vecLen } from "../explode/engine.ts";
import { visibleIds } from "../construction-sequence/visibility.ts";
import { STAGE_MAX } from "../construction-sequence/stages.ts";
import { tradeOf, TRADE_IDS } from "./infer.ts";

describe("integrated trades house", () => {
  const graph = buildPeiHouse();

  it("keeps one canonical graph with semantic ids", () => {
    assert.equal(graph.id, "PEI-PART9-DEMO-001");
    assert.equal(graph.version, "0.2.0");
    const ids = Object.keys(graph.components);
    assert.equal(ids.length, new Set(ids).size);
    assert.ok(ids.length > 200);
    assert.ok(ids.every((id) => !/^mesh\d+$/i.test(id)));
    assert.deepEqual(checkGraphIntegrity(graph), []);
    assert.equal(hashGraph(graph), hashGraph(buildPeiHouse()));
  });

  it("contains every trade crate in the same house", () => {
    const trades = new Set(Object.values(graph.components).map((c) => tradeOf(c)));
    for (const t of TRADE_IDS) assert.ok(trades.has(t), t);
    const need = [
      "plumbing.dwv.stack.001",
      "plumbing.fixture.sink.kitchen",
      "electrical.panel.main",
      "electrical.device.receptacle.front.001",
      "hvac.heatpump.indoor.001",
      "hvac.exhaust.bath.001",
      "envelope.window.front.001",
      "thermal.wall.front.air-barrier",
      "finish.drywall.front.panel.000",
      "finish.drywall.bath.panel.001",
    ];
    for (const id of need) assert.ok(graph.components[id], id);
  });

  it("dense zones exist", () => {
    const tags = Object.values(graph.components).flatMap((c) => c.tags ?? []);
    assert.ok(tags.includes("window-wall"));
    assert.ok(tags.includes("bath"));
    assert.ok(tags.includes("kitchen"));
    assert.ok(tags.includes("mechanical"));
  });

  it("construction sequence reaches finish after structure", () => {
    const early = visibleIds(graph, 12, new Set());
    const late = visibleIds(graph, STAGE_MAX, new Set());
    assert.ok(late.length > early.length);
    const drywall = Object.values(graph.components).find((c) => c.type === "drywall")!;
    assert.ok(drywall.assembly.stage > 12);
  });

  it("trade explode moves only that trade", () => {
    const boxes = Object.values(graph.components).filter((c) => c.geometry.kind === "box");
    const moved = boxes.filter((c) => vecLen(explodeOffset(graph, c, 1, "trade:plumbing")) > 0);
    assert.ok(moved.length > 5);
    assert.ok(moved.every((c) => tradeOf(c) === "plumbing"));
    const joist = boxes.find((c) => c.type === "floor-joist")!;
    assert.deepEqual(explodeOffset(graph, joist, 1, "trade:plumbing"), [0, 0, 0]);
  });

  it("local bathroom wall explode includes services hosted on that wall", () => {
    const wall = "assembly.wall.bath";
    const stack = graph.components["plumbing.dwv.stack.001"]!;
    assert.ok(vecLen(explodeOffset(graph, stack, 1, wall)) > 0);
  });
});
