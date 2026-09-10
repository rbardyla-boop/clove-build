import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { hashGraph } from "../building-graph/hash.ts";
import { reachable } from "../system-graph/trace.ts";
import { applyCommand, createSnapshot } from "./apply.ts";
import { explodeOffset } from "../explode/engine.ts";

describe("trade isolation gauntlet", () => {
  const graph = buildPeiHouse();
  const plumbing = graph.systems.find((s) => s.trade === "plumbing")!;
  const electrical = graph.systems.find((s) => s.trade === "electrical")!;

  it("plumbing mutation does not change electrical topology objects", () => {
    const before = electrical.connections.map((c) => c.id).join(",");
    let s = createSnapshot(graph);
    s = applyCommand(s, { type: "SET_MODE", mode: "break-it" });
    s = applyCommand(s, { type: "REMOVE_COMPONENT", id: "plumbing.dwv.stack.001" });
    assert.equal(s.graph.systems.find((g) => g.trade === "electrical")!.connections.map((c) => c.id).join(","), before);
    assert.equal(
      reachable(electrical, "electrical.device.receptacle.front.001", "electrical.panel.main", s.removedIds, ["circuit"]),
      true,
    );
    assert.equal(
      reachable(plumbing, "plumbing.fixture.sink.bath", "plumbing.dwv.building-drain.001", s.removedIds, ["drain"]),
      false,
    );
  });

  it("electrical trace does not mutate the building graph", () => {
    const before = hashGraph(graph);
    let s = createSnapshot(graph);
    s = applyCommand(s, { type: "TRACE_FROM", id: "electrical.device.luminaire.bath.001" });
    assert.ok(s.trace);
    assert.equal(hashGraph(s.graph), before);
    assert.equal(s.graph, graph);
  });

  it("HVAC visibility does not change structural existence", () => {
    let s = createSnapshot(graph);
    s = applyCommand(s, { type: "SET_TRADE_LAYER", trade: "hvac", state: "off" });
    assert.ok(s.graph.components["assembly.wall.front.stud.00"]);
    assert.ok(s.graph.components["hvac.heatpump.indoor.001"]);
  });

  it("hiding drywall does not delete concealed systems", () => {
    let s = createSnapshot(graph);
    s = applyCommand(s, { type: "SET_HIDE_FINISH", enabled: true });
    s = applyCommand(s, { type: "HIDE_COMPONENT", id: "finish.drywall.bath.panel.001" });
    assert.ok(s.graph.components["plumbing.dwv.stack.001"]);
    assert.ok(s.graph.components["electrical.cable.bath.002"]);
  });

  it("explode transforms are not rule inputs", () => {
    const c = graph.components["plumbing.dwv.stack.001"]!;
    const center = c.geometry.center.slice() as [number, number, number];
    explodeOffset(graph, c, 1, "whole");
    assert.deepEqual(c.geometry.center, center);
  });
});
