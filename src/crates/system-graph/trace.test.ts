import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { reachable, traceFromComponent } from "./trace.ts";

describe("system graph trace", () => {
  const graph = buildPeiHouse();
  const plumbing = graph.systems.find((s) => s.trade === "plumbing")!;
  const electrical = graph.systems.find((s) => s.trade === "electrical")!;
  const hvac = graph.systems.find((s) => s.trade === "hvac")!;

  it("has three networked trades with resolving component ids", () => {
    assert.ok(plumbing.nodes.length > 8);
    assert.ok(electrical.nodes.length > 8);
    assert.ok(hvac.nodes.length > 6);
    for (const sys of graph.systems) {
      for (const n of sys.nodes) assert.ok(graph.components[n.componentId], n.componentId);
      for (const c of sys.connections) {
        assert.ok(sys.nodes.some((n) => n.id === c.from), c.from);
        assert.ok(sys.nodes.some((n) => n.id === c.to), c.to);
      }
    }
  });

  it("traces a lavatory to the building drain", () => {
    const walk = traceFromComponent(graph, "plumbing", "plumbing.fixture.sink.bath", [], ["drain"]);
    assert.ok(walk.componentIds.includes("plumbing.dwv.building-drain.001"));
  });

  it("disconnecting a trap cuts the drain path", () => {
    assert.equal(
      reachable(plumbing, "plumbing.fixture.sink.bath", "plumbing.dwv.building-drain.001", [], ["drain"]),
      true,
    );
    assert.equal(
      reachable(plumbing, "plumbing.fixture.sink.bath", "plumbing.dwv.building-drain.001", ["plumbing.dwv.trap.lav.001"], ["drain"]),
      false,
    );
  });

  it("traces a receptacle to the panel", () => {
    const walk = traceFromComponent(graph, "electrical", "electrical.device.receptacle.front.001", [], ["circuit"]);
    assert.ok(walk.componentIds.includes("electrical.panel.main"));
  });

  it("opening a cable cuts the electrical path", () => {
    assert.equal(
      reachable(electrical, "electrical.device.receptacle.front.001", "electrical.panel.main", ["electrical.cable.receptacles.001"], ["circuit"]),
      false,
    );
  });

  it("traces bath exhaust to the outlet", () => {
    const walk = traceFromComponent(graph, "hvac", "hvac.exhaust.bath.001", [], ["exhaust"]);
    assert.ok(walk.componentIds.includes("hvac.exhaust.bath.outlet"));
  });

  it("reset of overlay does not mutate the system graph", () => {
    const before = plumbing.connections.length;
    traceFromComponent(graph, "plumbing", "plumbing.fixture.sink.kitchen", ["plumbing.dwv.branch.kitchen.001"]);
    assert.equal(plumbing.connections.length, before);
  });
});
