import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { evaluateRelation, evaluateRelations } from "./engine.ts";

describe("dimensional relations", () => {
  it("intact PEI stack containment holds geometrically, not by id magic", () => {
    const graph = buildPeiHouse();
    const rel = graph.relations?.find((r) => r.id === "rel.stack-in-wetwall");
    assert.ok(rel);
    const ev = evaluateRelation(graph, rel!);
    assert.equal(ev.ok, true, ev.reason);
  });

  it("fails when the stack is moved out of the wall", () => {
    const graph = structuredClone(buildPeiHouse());
    graph.components["plumbing.dwv.stack.001"]!.geometry.center = [0, 1, 0];
    const rel = graph.relations!.find((r) => r.id === "rel.stack-in-wetwall")!;
    const ev = evaluateRelation(graph, rel);
    assert.equal(ev.ok, false);
  });

  it("fails a missing host", () => {
    const graph = structuredClone(buildPeiHouse());
    delete graph.components["assembly.wall.bath"];
    const rel = graph.relations!.find((r) => r.id === "rel.stack-in-wetwall")!;
    assert.equal(evaluateRelation(graph, rel).ok, false);
  });

  it("evaluates every declared relation without throwing", () => {
    const hits = evaluateRelations(buildPeiHouse());
    assert.ok(hits.length >= 3);
  });
});
