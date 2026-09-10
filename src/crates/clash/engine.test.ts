import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { findClashes } from "./engine.ts";

describe("clash engine", () => {
  const graph = buildPeiHouse();

  it("intact specimen has no unregistered geometric clashes", () => {
    const clashes = findClashes(graph).filter((c) => c.kind === "GEOMETRIC_CLASH");
    assert.deepEqual(clashes, []);
  });

  it("penetration hosts and trade components resolve", () => {
    const missing = findClashes(graph).filter((c) => c.kind === "MISSING_PENETRATION");
    assert.deepEqual(missing, []);
    const pens = Object.values(graph.components).filter((c) => c.type === "penetration");
    assert.ok(pens.length >= 4);
    for (const p of pens) {
      assert.ok(p.penetration);
      assert.ok(graph.components[p.penetration!.hostId]);
      assert.ok(graph.components[p.penetration!.tradeComponentId]);
    }
  });

  it("system nodes resolve", () => {
    const bad = findClashes(graph).filter((c) => c.kind === "DISCONNECTED_SYSTEM");
    assert.deepEqual(bad, []);
  });
});
