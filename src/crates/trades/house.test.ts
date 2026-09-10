import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { Y } from "../../specimen/pei-part9-house/params.ts";
import { hashGraph } from "../building-graph/hash.ts";
import { checkGraphIntegrity } from "../building-graph/integrity.ts";
import { explodeOffset, vecLen } from "../explode/engine.ts";
import { visibleIds } from "../construction-sequence/visibility.ts";
import { STAGE_MAX } from "../construction-sequence/stages.ts";
import { tradeOf, TRADE_IDS } from "./infer.ts";

describe("integrated trades house", () => {
  const graph = buildPeiHouse();

  it("keeps one canonical graph with semantic ids", () => {
    assert.equal(graph.id, "PEI-PART9-DEMO-001");
    assert.equal(graph.version, "0.2.0");
    const ids = Object.keys(graph.components);
    assert.equal(ids.length, new Set(ids).size);
    assert.ok(ids.length > 200);
    assert.ok(ids.every((id) => !/^mesh\d+$/i.test(id)));
    assert.deepEqual(checkGraphIntegrity(graph), []);
    assert.equal(hashGraph(graph), hashGraph(buildPeiHouse()));
  });

  it("contains every trade crate in the same house", () => {
    const trades = new Set(Object.values(graph.components).map((c) => tradeOf(c)));
    for (const t of TRADE_IDS) assert.ok(trades.has(t), t);
    const need = [
      "plumbing.dwv.stack.001",
      "plumbing.fixture.sink.kitchen",
      "electrical.panel.main",
      "electrical.device.receptacle.front.001",
      "hvac.heatpump.indoor.001",
      "hvac.exhaust.bath.001",
      "envelope.window.front.001",
      "thermal.wall.front.air-barrier",
      "finish.drywall.front.panel.000",
      "finish.drywall.bath.panel.001",
    ];
    for (const id of need) assert.ok(graph.components[id], id);
  });

  it("dense zones exist", () => {
    const tags = Object.values(graph.components).flatMap((c) => c.tags ?? []);
    assert.ok(tags.includes("window-wall"));
    assert.ok(tags.includes("bath"));
    assert.ok(tags.includes("kitchen"));
    assert.ok(tags.includes("mechanical"));
  });

  it("construction sequence reaches finish after structure", () => {
    const early = visibleIds(graph, 12, new Set());
    const late = visibleIds(graph, STAGE_MAX, new Set());
    assert.ok(late.length > early.length);
    const drywall = Object.values(graph.components).find((c) => c.type === "drywall")!;
    assert.ok(drywall.assembly.stage > 12);
  });

  it("trade explode moves only that trade", () => {
    const boxes = Object.values(graph.components).filter((c) => c.geometry.kind === "box");
    const moved = boxes.filter((c) => vecLen(explodeOffset(graph, c, 1, "trade:plumbing")) > 0);
    assert.ok(moved.length > 5);
    assert.ok(moved.every((c) => tradeOf(c) === "plumbing"));
    const joist = boxes.find((c) => c.type === "floor-joist")!;
    assert.deepEqual(explodeOffset(graph, joist, 1, "trade:plumbing"), [0, 0, 0]);
  });

  it("local bathroom wall explode includes services hosted on that wall", () => {
    const wall = "assembly.wall.bath";
    const stack = graph.components["plumbing.dwv.stack.001"]!;
    assert.ok(vecLen(explodeOffset(graph, stack, 1, wall)) > 0);
  });

  it("kitchen water lines are under the subfloor, not in the room", () => {
    const floorTop = graph.components["subfloor.0"]!.geometry.center[1] + graph.components["subfloor.0"]!.geometry.size[1] / 2;
    for (const id of [
      "plumbing.supply.cold.kitchen.001",
      "plumbing.supply.cold.kitchen.002",
      "plumbing.supply.hot.kitchen.001",
      "plumbing.supply.hot.kitchen.002",
    ]) {
      assert.ok(graph.components[id]!.geometry.center[1] < floorTop, id);
    }
  });

  it("kitchen drain hangs below the joists instead of boring every bay", () => {
    const drain = graph.components["plumbing.dwv.branch.kitchen.001"]!;
    assert.ok(drain.geometry.center[1] < Y.sillTop, `drain y=${drain.geometry.center[1]} sill=${Y.sillTop}`);
  });

  it("kitchen vent riser is beside window W2, not through the glass", () => {
    const win = graph.components["envelope.window.front.002"]!;
    const rise = graph.components["plumbing.vent.kitchen.rise"]!;
    const wx = win.geometry.center[0];
    const ww = win.geometry.size[0];
    const rx = rise.geometry.center[0];
    assert.ok(rx < wx - ww / 2 - 0.04 || rx > wx + ww / 2 + 0.04, `vent x=${rx} window ${wx}±${ww / 2}`);
  });

  it("HVAC trunks hang below the joists", () => {
    for (const id of ["hvac.duct.supply.main", "hvac.duct.supply.front", "hvac.duct.supply.bath", "hvac.duct.return.main"]) {
      const c = graph.components[id]!;
      assert.ok(c.geometry.center[1] < Y.sillTop, `${id} y=${c.geometry.center[1]}`);
    }
  });

  it("kitchen return wall is studs, not one lumber slab", () => {
    const studs = Object.values(graph.components).filter((c) => c.parentId === "assembly.wall.kitchen" && c.type === "common-stud");
    assert.ok(studs.length >= 6, `studs=${studs.length}`);
    assert.ok(studs.every((s) => s.geometry.size[0] < 0.1), "a stud is not a 3 m panel");
  });

  it("bathroom wet wall is 2×6 so the soil stack has a cavity", () => {
    const wall = graph.components["assembly.wall.bath"]!;
    const stack = graph.components["plumbing.dwv.stack.001"]!;
    const wallDepth = Math.min(wall.geometry.size[0], wall.geometry.size[2]);
    const stackDia = Math.min(stack.geometry.size[0], stack.geometry.size[2]);
    assert.ok(wallDepth >= 0.13, `wet wall depth ${wallDepth}`);
    assert.ok(wallDepth - stackDia >= 0.02, `leftover ${wallDepth - stackDia}`);
  });

  it("bath cable is L-shaped in the floor, not a room diagonal", () => {
    const a = graph.components["electrical.cable.bath.001"]!;
    const b = graph.components["electrical.cable.bath.001b"]!;
    const alongZ = a.geometry.size[2] > a.geometry.size[0];
    const alongX = b.geometry.size[0] > b.geometry.size[2];
    assert.ok(alongZ && alongX, "bath home-run should be an axis-aligned L");
  });
});
