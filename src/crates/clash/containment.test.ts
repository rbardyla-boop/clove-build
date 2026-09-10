import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { evaluateWetWallFit } from "./containment.ts";

describe("wet-wall spatial containment", () => {
  it("passes when the clipped stack sits in the 2×6 cavity and misses studs", () => {
    const fit = evaluateWetWallFit(buildPeiHouse());
    assert.equal(fit.contained, true, fit.reason);
    assert.equal(fit.hostHits.length, 0);
    assert.ok(fit.leftoverMm >= 20, `leftover ${fit.leftoverMm}`);
    assert.ok(fit.wallDepthMm >= 130);
  });

  it("fails when the stack is moved outside the wall cavity", () => {
    const graph = structuredClone(buildPeiHouse());
    const stack = graph.components["plumbing.dwv.stack.001"]!;
    stack.geometry.center = [0, stack.geometry.center[1], stack.geometry.center[2]];
    const fit = evaluateWetWallFit(graph);
    assert.equal(fit.contained, false);
  });

  it("fails when the stack occupies a stud without a penetration", () => {
    const graph = structuredClone(buildPeiHouse());
    const stack = graph.components["plumbing.dwv.stack.001"]!;
    const stud = graph.components["assembly.wall.bath.stud.03"]!;
    stack.geometry.center = [stud.geometry.center[0], stack.geometry.center[1], stud.geometry.center[2]];
    const fit = evaluateWetWallFit(graph);
    assert.equal(fit.contained, false);
    assert.ok(fit.hostHits.length > 0 || /not contained|occupies solid/i.test(fit.reason), fit.reason);
  });
});
