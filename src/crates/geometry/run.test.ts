import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { classifyDwvRun, linearRun } from "./run.ts";

describe("DWV endpoint runs", () => {
  const graph = buildPeiHouse();

  it("stores start/end elevation and flow direction on DWV pipes", () => {
    const c = graph.components["plumbing.dwv.branch.kitchen.001"]!;
    assert.ok(c.run);
    assert.equal(c.run!.flow, "from-to");
    assert.equal(c.run!.from.length, 3);
    assert.equal(c.run!.to.length, 3);
  });

  it("classifies horizontal drains as sloped from endpoint elevations, not box size", () => {
    const c = graph.components["plumbing.dwv.branch.kitchen.001"]!;
    const ev = classifyDwvRun(c);
    assert.equal(ev.kind, "sloped");
    assert.ok((ev.fall ?? 0) > 0);
    assert.ok((ev.horiz ?? 0) > 0.5);
  });

  it("recognizes a future sloped run from endpoints even if the box looks long and flat", () => {
    const proto = graph.components["plumbing.dwv.branch.kitchen.001"]!;
    const sloped = {
      ...proto,
      run: linearRun([2.75, 0.2, 3.05], [-2.25, 0.1, 3.05]),
    };
    const ev = classifyDwvRun(sloped);
    assert.equal(ev.kind, "sloped");
    assert.ok(Math.abs((ev.fall ?? 0) - 0.1) < 1e-9);
    assert.ok((ev.horiz ?? 0) > 4);
  });

  it("treats a run that rises in flow direction as reverse-grade, not sloped", () => {
    const proto = graph.components["plumbing.dwv.branch.kitchen.001"]!;
    const rising = {
      ...proto,
      run: linearRun([2.75, 0.1, 3.05], [-2.25, 0.2, 3.05]),
    };
    const ev = classifyDwvRun(rising);
    assert.equal(ev.kind, "reverse-grade");
    assert.ok((ev.fall ?? 0) < 0);
  });

  it("does not treat vertical drops as level drains", () => {
    const ev = classifyDwvRun(graph.components["plumbing.dwv.branch.kitchen.drop"]!);
    assert.equal(ev.kind, "short-or-vertical");
  });
});
