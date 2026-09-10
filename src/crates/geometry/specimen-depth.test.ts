import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildSlabCottage } from "../../specimen/slab-cottage/index.ts";
import { buildRuralPoolHouse } from "../../specimen/rural-pool/index.ts";
import { findRoutingIssues } from "../routing/engine.ts";
import { findRecreationIssues } from "../recreation/engine.ts";
import { roofDeckY } from "../site/facts.ts";

function count(graph: { components: Record<string, { type: string }> }, type: string) {
  return Object.values(graph.components).filter((c) => c.type === type).length;
}

describe("specimen depth", () => {
  const slab = buildSlabCottage();
  const rural = buildRuralPoolHouse();

  it("slab cottage is a framed dwelling, not a four-wall fixture", () => {
    assert.ok(count(slab, "common-stud") >= 40, `studs=${count(slab, "common-stud")}`);
    assert.ok(count(slab, "rafter") >= 24, `rafters=${count(slab, "rafter")}`);
    assert.ok(count(slab, "ceiling-joist") >= 12);
    assert.ok(count(slab, "king-stud") >= 8);
    assert.ok(count(slab, "header") >= 4);
    assert.ok(slab.components["roof.sheathing.s"]?.geometry.rotation);
    assert.ok(slab.components["rafter.s.00"]?.geometry.rotation);
    assert.ok(slab.components["slab.edge.front"]);
    assert.ok(slab.components["foundation.base"]);
    assert.ok(Object.keys(slab.components).length > 180);
  });

  it("slab kitchen attic vent stays below the roof deck", () => {
    const c = slab.components["plumbing.vent.kitchen.001"]!;
    assert.ok(c.run);
    for (const p of [c.run!.from, c.run!.to, c.geometry.center]) {
      assert.ok(p[1] < roofDeckY(slab, p[2]) - 0.04, `${p} vs ${roofDeckY(slab, p[2])}`);
    }
  });

  it("slab DWV lives under the slab, not in the room", () => {
    const c = slab.components["plumbing.dwv.branch.kitchen.001"]!;
    assert.ok(c.geometry.center[1] < slab.site!.floorTop - 0.1);
    assert.ok(c.run);
    const hits = findRoutingIssues(slab).filter((h) =>
      ["OCCUPIED_SPACE", "THROUGH_ROOF", "SOLID_HOST_COLLISION"].includes(h.kind),
    );
    assert.deepEqual(hits, [], JSON.stringify(hits.slice(0, 8)));
  });

  it("rural house has the same class of dwelling plus pool systems", () => {
    assert.ok(count(rural, "common-stud") >= 40);
    assert.ok(count(rural, "rafter") >= 24);
    assert.ok(rural.components["pool.001"]);
    assert.ok(rural.components["pool.pump.001"]);
    assert.ok(rural.components["pool.filter.001"]);
    assert.ok(rural.components["pool.pipe.suction.001"]);
    assert.ok(rural.components["electrical.disconnect.pool"]);
    assert.ok(rural.components["hottub.001"]);
    assert.ok(rural.components["deck.platform"]);
    assert.ok(rural.components["equipment.pad.001"]);
    assert.ok(rural.systems.some((s) => s.id === "system.pool" && s.connections.length >= 4));
  });

  it("intact rural recreation geometry passes", () => {
    assert.deepEqual(findRecreationIssues(rural), []);
  });

  it("flags a cable through the pool water", () => {
    const clone = structuredClone(rural);
    const t = clone.components["electrical.cable.kitchen.001"]!;
    clone.components["cable.through.pool"] = {
      ...t,
      id: "cable.through.pool",
      label: "Cable through pool",
      tags: ["electrical"],
      geometry: { kind: "box", center: [0, -0.28, rural.components["pool.001"]!.geometry.center[2]], size: [4, 0.02, 0.02] },
    };
    const hits = findRecreationIssues(clone).filter((h) => h.kind === "THROUGH_WATER");
    assert.ok(hits.some((h) => h.a === "cable.through.pool"), JSON.stringify(hits));
  });

  it("flags pool equipment lifted off the pad", () => {
    const clone = structuredClone(rural);
    clone.components["pool.pump.001"]!.geometry.center = [8, 0.4, 8];
    const hits = findRecreationIssues(clone).filter((h) => h.kind === "EQUIPMENT_OFF_PAD");
    assert.ok(hits.some((h) => h.a === "pool.pump.001"), JSON.stringify(hits));
  });

  it("flags disconnected pool circulation", () => {
    const clone = structuredClone(rural);
    clone.systems = clone.systems.map((s) => (s.id === "system.pool" ? { ...s, connections: [] } : s));
    const hits = findRecreationIssues(clone).filter((h) => h.kind === "DISCONNECTED_CIRCULATION");
    assert.ok(hits.length >= 1, JSON.stringify(hits));
  });
});
