import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { buildSlabCottage } from "../../specimen/slab-cottage/index.ts";
import { buildRuralPoolHouse } from "../../specimen/rural-pool/index.ts";
import { classifyDwvRun } from "./run.ts";
import { siteFacts } from "../site/facts.ts";

describe("construction depth", () => {
  it("horizontal kitchen DWV is sloped with the flow, not a flat AABB truth", () => {
    const graph = buildPeiHouse();
    const c = graph.components["plumbing.dwv.branch.kitchen.001"]!;
    assert.ok(c.run);
    const ev = classifyDwvRun(c);
    assert.equal(ev.kind, "sloped", JSON.stringify(ev));
    assert.ok((ev.fall ?? 0) > 0);
    assert.ok(c.run!.from[1] > c.run!.to[1]);
    assert.equal(c.run!.authorityClass, "PROJECT_MODEL_ASSUMPTION");
  });

  it("unmodelled DWV is distinct from reverse-grade", () => {
    const graph = structuredClone(buildPeiHouse());
    const c = graph.components["plumbing.dwv.branch.kitchen.001"]!;
    delete c.run;
    assert.equal(classifyDwvRun(c).kind, "unmodelled");
    c.run = { from: [0, 0.2, 0], to: [3, 0.4, 0], flow: "from-to" };
    assert.equal(classifyDwvRun(c).kind, "reverse-grade");
  });

  it("site facts come from the graph, not specimen params", () => {
    const pei = siteFacts(buildPeiHouse());
    const slab = siteFacts(buildSlabCottage());
    assert.equal(pei.constructionType, "basement");
    assert.equal(slab.constructionType, "slab-on-grade");
    assert.ok(pei.floorTop > slab.floorTop);
  });

  it("three specimens are distinct dwellings", () => {
    const a = buildPeiHouse();
    const b = buildSlabCottage();
    const c = buildRuralPoolHouse();
    assert.notEqual(a.id, b.id);
    assert.notEqual(b.id, c.id);
    assert.ok(Object.keys(a.components).length > 200);
    assert.ok(c.components["pool.001"]);
    assert.ok(c.components["hottub.001"]);
    assert.ok(c.components["deck.platform"]);
  });

  it("PEI house has attachments and physical penetrations", () => {
    const g = buildPeiHouse();
    assert.ok((g.attachments ?? []).length >= 1);
    const pens = Object.values(g.components).filter((c) => c.type === "penetration");
    assert.ok(pens.length >= 4);
    assert.ok(g.components["sill.front.gasket"]);
    assert.ok(g.components["anchor.nw"]);
    assert.ok(g.components["roof.fascia.s"]);
    assert.ok(g.components["hvac.hanger.supply.001"]);
  });
});
