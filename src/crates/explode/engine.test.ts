import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { explodeOffset, vecLen } from "./engine.ts";

describe("explode engine", () => {
  const graph = buildPeiHouse();
  const boxes = Object.values(graph.components).filter((c) => c.geometry.kind === "box");
  const sample = boxes[12]!;

  it("amount 0 is canonical (zero offset)", () => {
    for (const c of boxes) {
      assert.deepEqual(explodeOffset(graph, c, 0, "whole"), [0, 0, 0]);
    }
  });

  it("full explode separates members", () => {
    const moved = boxes.filter((c) => vecLen(explodeOffset(graph, c, 1, "whole")) > 0.05);
    assert.ok(moved.length > 20);
  });

  it("repeated explode/collapse cycles do not drift", () => {
    const a = explodeOffset(graph, sample, 1, "whole");
    const z = explodeOffset(graph, sample, 0, "whole");
    const b = explodeOffset(graph, sample, 1, "whole");
    assert.deepEqual(z, [0, 0, 0]);
    assert.deepEqual(a, b);
  });

  it("local explode only moves the chosen assembly", () => {
    const wall = "assembly.wall.front";
    const local = boxes.filter((c) => vecLen(explodeOffset(graph, c, 1, wall)) > 0);
    assert.ok(local.length > 5);
    assert.ok(local.every((c) => c.assembly.explodeGroup === wall || c.id === wall));
    const joist = boxes.find((c) => c.type === "floor-joist")!;
    assert.deepEqual(explodeOffset(graph, joist, 1, wall), [0, 0, 0]);
  });
});
