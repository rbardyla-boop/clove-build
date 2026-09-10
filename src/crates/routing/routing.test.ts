import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FAULT_MIDROOM, graphWithFaults } from "../break-it/faults.ts";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { Y } from "../../specimen/pei-part9-house/params.ts";
import { findRoutingIssues } from "./engine.ts";
import { routeSegments } from "./segments.ts";
import { roofDeckY } from "../site/facts.ts";

describe("routing engine", () => {
  const graph = buildPeiHouse();

  it("intact house has no occupied, floating, or missing-penetration routing issues", () => {
    const hits = findRoutingIssues(graph);
    const bad = hits.filter((h) =>
      ["OCCUPIED_SPACE", "FLOATING_COMPONENT", "MISSING_PENETRATION", "SOLID_HOST_COLLISION", "DISCONNECTED_ROUTE", "THROUGH_ROOF"].includes(h.kind),
    );
    assert.deepEqual(bad, [], JSON.stringify(bad));
  });

  it("kitchen supply segments exist and sit under the floor", () => {
    const segs = routeSegments(graph);
    const cold = segs.find((s) => s.id === "plumbing.supply.cold.kitchen.001");
    assert.ok(cold);
    assert.ok(cold!.hostSpace !== "OCCUPIED_ROOM", cold!.hostSpace);
    assert.ok(graph.components[cold!.id]!.geometry.center[1] < Y.floorTop);
  });

  it("flags a cable through the living room", () => {
    const clone = structuredClone(graph);
    const t = clone.components["electrical.cable.kitchen.001"]!;
    clone.components["cable.midroom.test"] = {
      ...t,
      id: "cable.midroom.test",
      label: "Mid-room cable",
      geometry: { kind: "box", center: [0, Y.floorTop + 0.7, 0], size: [3.6, 0.016, 0.016] },
      assembly: { ...t.assembly, explodeGroup: "assembly.electrical" },
      tags: ["electrical"],
    };
    const hits = findRoutingIssues(clone).filter((h) => h.kind === "OCCUPIED_SPACE");
    assert.ok(hits.some((h) => h.a === "cable.midroom.test"), JSON.stringify(hits));
  });

  it("flags a duct through solid framing without a penetration", () => {
    const clone = structuredClone(graph);
    const t = clone.components["hvac.duct.supply.main"]!;
    const stud = Object.values(clone.components).find((c) => c.type === "common-stud")!;
    clone.components["duct.through.stud"] = {
      ...t,
      id: "duct.through.stud",
      label: "Duct through stud",
      geometry: {
        kind: "box",
        center: stud.geometry.center,
        size: [Math.max(stud.geometry.size[0] * 0.9, 0.08), Math.max(stud.geometry.size[1] * 0.6, 0.4), Math.max(stud.geometry.size[2] * 0.9, 0.08)],
      },
      assembly: { ...t.assembly, explodeGroup: "assembly.hvac" },
    };
    const hits = findRoutingIssues(clone).filter((h) => h.kind === "SOLID_HOST_COLLISION");
    assert.ok(hits.some((h) => h.a === "duct.through.stud"), JSON.stringify(hits));
  });

  it("flags a service through the foundation with no penetration", () => {
    const clone = structuredClone(graph);
    delete clone.components["penetration.foundation.left.plumbing.002"];
    const hits = findRoutingIssues(clone);
    assert.ok(
      hits.some((h) => h.kind === "SOLID_HOST_COLLISION" || h.kind === "MISSING_PENETRATION"),
      JSON.stringify(hits.slice(0, 5)),
    );
  });

  it("correct under-floor pipe and attic vent pass", () => {
    const hits = findRoutingIssues(graph).filter((h) =>
      ["plumbing.supply.cold.kitchen.001", "plumbing.vent.kitchen.001", "plumbing.vent.kitchen.into-attic"].includes(h.a),
    );
    assert.deepEqual(hits, []);
  });

  it("kitchen attic vent stays below the roof deck", () => {
    const c = graph.components["plumbing.vent.kitchen.001"]!;
    assert.ok(c.run);
    for (const p of [c.run!.from, c.run!.to, c.geometry.center]) {
      assert.ok(p[1] < roofDeckY(graph, p[2]) - 0.05, `point ${p} vs deck ${roofDeckY(graph, p[2])}`);
    }
  });

  it("stack vent through the roof is allowed because a roof penetration exists", () => {
    const hits = findRoutingIssues(graph).filter((h) => h.a === "plumbing.vent.stack.001" && h.kind === "THROUGH_ROOF");
    assert.deepEqual(hits, []);
  });

  it("flags a kitchen attic vent that runs through the roof covering", () => {
    const clone = structuredClone(graph);
    const v = clone.components["plumbing.vent.kitchen.001"]!;
    const z = 3.5;
    const y = roofDeckY(clone, z) + 0.2;
    v.run = { from: [3.4, y, z], to: [-2.2, y, z], flow: "from-to" };
    v.geometry = { kind: "box", center: [0.6, y, z], size: [5.6, 0.04, 0.04] };
    const hits = findRoutingIssues(clone).filter((h) => h.kind === "THROUGH_ROOF" && h.a === "plumbing.vent.kitchen.001");
    assert.ok(hits.length >= 1, JSON.stringify(findRoutingIssues(clone).filter((h) => h.kind === "THROUGH_ROOF")));
  });

  it("flags a duct filling the joist cavity", () => {
    const clone = structuredClone(graph);
    const t = clone.components["hvac.duct.supply.main"]!;
    clone.components["duct.in.joists"] = {
      ...t,
      id: "duct.in.joists",
      label: "Oversized joist duct",
      geometry: { kind: "box", center: [0, (Y.sillTop + Y.floorTop) / 2, 1.2], size: [2.4, 0.2, 0.2] },
      assembly: { ...t.assembly, explodeGroup: "assembly.hvac" },
    };
    const hits = findRoutingIssues(clone).filter((h) => h.kind === "IMPOSSIBLE_TRANSITION");
    assert.ok(hits.some((h) => h.a === "duct.in.joists"), JSON.stringify(hits));
  });

  it("flags a pipe through a window unit", () => {
    const clone = structuredClone(graph);
    const t = clone.components["plumbing.vent.kitchen.rise"]!;
    const win = clone.components["envelope.window.front.002"]!;
    clone.components["pipe.through.window"] = {
      ...t,
      id: "pipe.through.window",
      label: "Vent through glass",
      geometry: { kind: "box", center: win.geometry.center, size: [0.05, 1.4, 0.05] },
      assembly: { ...t.assembly, explodeGroup: "assembly.plumbing" },
      parentId: "assembly.plumbing",
    };
    const hits = findRoutingIssues(clone).filter((h) => h.kind === "SOLID_HOST_COLLISION");
    assert.ok(hits.some((h) => h.a === "pipe.through.window"), JSON.stringify(hits));
  });

  it("exposed mechanical-room equipment is not an occupied-space fail", () => {
    const hits = findRoutingIssues(graph).filter(
      (h) => h.kind === "OCCUPIED_SPACE" && (h.a.includes("waterheater") || h.a.includes("heatpump.indoor")),
    );
    assert.deepEqual(hits, []);
  });

  it("overlay mid-room fault fails occupied-space without changing the planned hash identity", () => {
    const faulted = graphWithFaults(graph, [FAULT_MIDROOM]);
    const hits = findRoutingIssues(faulted).filter((h) => h.kind === "OCCUPIED_SPACE");
    assert.ok(hits.some((h) => h.a === FAULT_MIDROOM));
    assert.equal(graph.components[FAULT_MIDROOM], undefined);
  });

  it("uses run.from/to when present instead of the bounding box (RUN-ENDPOINT-001)", () => {
    const clone = structuredClone(graph);
    const id = "plumbing.dwv.branch.kitchen.001";
    const c = clone.components[id]!;
    c.run = { from: [2.75, 0.22, 3.05], to: [-2.25, 0.12, 3.05], flow: "from-to" };
    const seg = routeSegments(clone).find((s) => s.id === id)!;
    assert.deepEqual(seg.from, [2.75, 0.22, 3.05]);
    assert.deepEqual(seg.to, [-2.25, 0.12, 3.05]);
  });

  it("fails reverse-grade DWV (DWV-GRADE-002)", () => {
    const clone = structuredClone(graph);
    const id = "plumbing.dwv.branch.kitchen.001";
    clone.components[id]!.run = { from: [2.75, 0.10, 3.05], to: [-2.25, 0.22, 3.05], flow: "from-to" };
    const hits = findRoutingIssues(clone).filter((h) => h.kind === "REVERSE_GRADE");
    assert.ok(hits.some((h) => h.a === id), JSON.stringify(hits));
  });
});
