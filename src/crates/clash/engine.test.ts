import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { Y } from "../../specimen/pei-part9-house/params.ts";
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

  it("intact specimen has no occupied-space distribution runs", () => {
    const occupied = findClashes(graph).filter((c) => c.kind === "OCCUPIED_SPACE");
    assert.deepEqual(occupied, []);
  });

  it("kitchen supply hangs under the subfloor", () => {
    for (const id of [
      "plumbing.supply.cold.kitchen.001",
      "plumbing.supply.cold.kitchen.002",
      "plumbing.supply.hot.kitchen.001",
      "plumbing.supply.hot.kitchen.002",
    ]) {
      const c = graph.components[id];
      assert.ok(c, id);
      assert.ok(
        c.geometry.center[1] < Y.floorTop,
        `${id} y=${c.geometry.center[1]} is not under floorTop=${Y.floorTop}`,
      );
    }
    assert.ok(graph.components["plumbing.supply.cold.kitchen.003"]);
    assert.ok(graph.components["penetration.floor.plumbing.cold.kitchen"]);
  });

  it("flags a long supply run through occupied living space (ROUTE-001)", () => {
    const template = graph.components["plumbing.supply.cold.kitchen.001"]!;
    const clone = structuredClone(graph);
    clone.components["pipe.midroom.test"] = {
      ...structuredClone(template),
      id: "pipe.midroom.test",
      label: "Mid-room kitchen run",
      parentId: "assembly.plumbing",
      geometry: { kind: "box", center: [0, Y.floorTop + 0.65, 0], size: [4.2, 0.022, 0.022] },
      assembly: { ...template.assembly, explodeGroup: "assembly.plumbing" },
      tags: ["plumbing", "supply", "cold"],
    };
    const hits = findClashes(clone).filter((c) => c.kind === "OCCUPIED_SPACE");
    assert.ok(
      hits.some((h) => h.a === "pipe.midroom.test"),
      `expected occupied-space hit, got ${JSON.stringify(hits)}`,
    );
  });

  it("does not treat explodeGroup as wall-hosting (ROUTE-HOST-001)", () => {
    const template = graph.components["plumbing.supply.cold.kitchen.001"]!;
    const clone = structuredClone(graph);
    clone.components["pipe.fakewall.test"] = {
      ...structuredClone(template),
      id: "pipe.fakewall.test",
      label: "Explode-grouped room run",
      parentId: "assembly.wall.front",
      geometry: { kind: "box", center: [0, Y.floorTop + 0.65, 0], size: [4.2, 0.022, 0.022] },
      assembly: { ...template.assembly, explodeGroup: "assembly.wall.front" },
      tags: ["plumbing", "supply", "cold"],
    };
    const hits = findClashes(clone).filter((c) => c.kind === "OCCUPIED_SPACE");
    assert.ok(hits.some((h) => h.a === "pipe.fakewall.test"), JSON.stringify(hits));
  });

  it("does not treat a 350 mm inboard run as wall cavity (SPACE-WALL-001)", () => {
    const template = graph.components["plumbing.supply.cold.kitchen.001"]!;
    const clone = structuredClone(graph);
    const z = graph.components["assembly.wall.front.plate.bottom"]!.geometry.center[2] - 0.35;
    clone.components["pipe.inboard.test"] = {
      ...structuredClone(template),
      id: "pipe.inboard.test",
      label: "Inboard of front wall",
      parentId: "assembly.wall.front",
      geometry: { kind: "box", center: [0, Y.floorTop + 0.7, z], size: [4.0, 0.022, 0.022] },
      assembly: { ...template.assembly, explodeGroup: "assembly.wall.front" },
      tags: ["plumbing", "supply"],
    };
    const hits = findClashes(clone).filter((c) => c.kind === "OCCUPIED_SPACE");
    assert.ok(hits.some((h) => h.a === "pipe.inboard.test"), JSON.stringify(hits));
  });

  it("a registered penetration does not exempt host overlap outside the hole (PENETRATION-002)", () => {
    const clone = structuredClone(graph);
    const pen = clone.components["penetration.wall.bath.plumbing.003"]!;
    pen.geometry.center = [-2.25, pen.geometry.center[1], 0.8];
    const hits = findClashes(clone).filter(
      (c) => c.kind === "GEOMETRIC_CLASH" && c.a === "plumbing.dwv.stack.001",
    );
    assert.ok(hits.length > 0, JSON.stringify(findClashes(clone).filter((c) => c.kind === "GEOMETRIC_CLASH").slice(0, 6)));
  });
});
