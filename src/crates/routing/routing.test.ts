import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FAULT_MIDROOM, graphWithFaults } from "../break-it/faults.ts";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { Y } from "../../specimen/pei-part9-house/params.ts";
import { findRoutingIssues } from "./engine.ts";
import { routeSegments } from "./segments.ts";

describe("routing engine", () => {
  const graph = buildPeiHouse();

  it("intact house has no occupied, floating, or missing-penetration routing issues", () => {
    const hits = findRoutingIssues(graph);
    const bad = hits.filter((h) =>
      ["OCCUPIED_SPACE", "FLOATING_COMPONENT", "MISSING_PENETRATION", "SOLID_HOST_COLLISION", "DISCONNECTED_ROUTE"].includes(h.kind),
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
      ["plumbing.supply.cold.kitchen.001", "plumbing.vent.kitchen.001"].includes(h.a),
    );
    assert.deepEqual(hits, []);
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
});
