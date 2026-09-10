import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { hashGraph } from "./hash.ts";
import { checkGraphIntegrity } from "./integrity.ts";

describe("building graph", () => {
  const graph = buildPeiHouse();

  it("has stable specimen identity and unique component ids", () => {
    assert.equal(graph.id, "PEI-PART9-DEMO-001");
    const ids = Object.keys(graph.components);
    assert.equal(ids.length, new Set(ids).size);
    assert.ok(ids.length > 80);
  });

  it("parent/child and dependency refs are intact", () => {
    const issues = checkGraphIntegrity(graph);
    assert.deepEqual(issues, []);
  });

  it("baseline specimen is deterministic", () => {
    const a = hashGraph(graph);
    const b = hashGraph(buildPeiHouse());
    assert.equal(a, b);
    assert.equal(a.length, 8);
  });

  it("includes opening framing, sill, joists and rafters", () => {
    const types = new Set(Object.values(graph.components).map((c) => c.type));
    for (const t of [
      "footing",
      "foundation-wall",
      "sill-plate",
      "floor-joist",
      "header",
      "jack-stud",
      "king-stud",
      "rafter",
      "temporary-brace",
    ]) {
      assert.ok(types.has(t as never), `missing type ${t}`);
    }
  });
});
