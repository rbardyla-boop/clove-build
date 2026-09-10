import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { classifyComponent } from "./classify.ts";
import { SPACE_ZONES } from "./zones.ts";

describe("space model", () => {
  const graph = buildPeiHouse();

  it("classifies kitchen supply as under-floor / floor cavity, not occupied room", () => {
    for (const id of ["plumbing.supply.cold.kitchen.001", "plumbing.supply.hot.kitchen.001"]) {
      const c = graph.components[id]!;
      const z = classifyComponent(graph, c);
      assert.ok(
        z === "UNDER_FLOOR" || z === "FLOOR_CAVITY" || z === "MECHANICAL_SPACE",
        `${id} in ${z}`,
      );
    }
  });

  it("classifies kitchen attic vent as attic or ceiling cavity", () => {
    const z = classifyComponent(graph, graph.components["plumbing.vent.kitchen.001"]!);
    assert.ok(z === "ATTIC" || z === "CEILING_CAVITY" || z === "ROOF_SPACE", z);
  });

  it("classifies the water heater as mechanical / below grade", () => {
    const z = classifyComponent(graph, graph.components["plumbing.waterheater.001"]!);
    assert.ok(z === "MECHANICAL_SPACE" || z === "BELOW_GRADE" || z === "UNDER_FLOOR", z);
  });

  it("classifies outdoor heat pump as exterior", () => {
    const z = classifyComponent(graph, graph.components["hvac.heatpump.outdoor.001"]!);
    assert.equal(z, "EXTERIOR");
  });

  it("classifies kitchen sink as occupied / cabinet space, not wall cavity", () => {
    const z = classifyComponent(graph, graph.components["plumbing.fixture.sink.kitchen"]!);
    assert.equal(z, "OCCUPIED_ROOM");
  });

  it("classifies bathroom fixtures as occupied, not wall cavity", () => {
    for (const id of [
      "plumbing.fixture.toilet.bath",
      "plumbing.fixture.sink.bath",
      "plumbing.fixture.tub.bath",
      "plumbing.dwv.trap.kitchen.001",
    ]) {
      const z = classifyComponent(graph, graph.components[id]!);
      assert.equal(z, "OCCUPIED_ROOM", `${id} in ${z}`);
    }
  });

  it("still classifies the soil stack as shaft / wall cavity", () => {
    const z = classifyComponent(graph, graph.components["plumbing.dwv.stack.001"]!);
    assert.ok(z === "SHAFT" || z === "WALL_CAVITY", z);
  });

  it("exposes the zone vocabulary", () => {
    assert.ok(SPACE_ZONES.includes("OCCUPIED_ROOM"));
    assert.ok(SPACE_ZONES.includes("WALL_CAVITY"));
  });
});
