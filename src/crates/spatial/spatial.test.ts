import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeiHouse } from "../../specimen/pei-part9-house/index.ts";
import { buildSlabCottage } from "../../specimen/slab-cottage/index.ts";
import { buildRuralPoolHouse } from "../../specimen/rural-pool/index.ts";
import { occupancyRole } from "./occupancy.ts";
import { findSheetCoveringOpenings, findSpatialIssues, findVesselClearanceIssues } from "./awareness.ts";

describe("spatial awareness", () => {
  it("classifies openings, envelope sheets and vessels by occupancy role", () => {
    assert.equal(occupancyRole("door-unit"), "opening");
    assert.equal(occupancyRole("window-unit"), "opening");
    assert.equal(occupancyRole("cladding"), "sheet");
    assert.equal(occupancyRole("wrb"), "sheet");
    assert.equal(occupancyRole("pool"), "vessel");
    assert.equal(occupancyRole("hot-tub"), "vessel");
    assert.equal(occupancyRole("common-stud"), "solid");
  });

  it("detects uncut envelope sheets over openings on every dwelling", () => {
    for (const g of [buildPeiHouse(), buildSlabCottage(), buildRuralPoolHouse()]) {
      const hits = findSheetCoveringOpenings(g);
      assert.ok(hits.length >= 1, `${g.id} expected SHEET_COVERS_OPENING`);
      assert.ok(hits.some((h) => h.b.includes("door") || g.components[h.b]?.type === "door-unit"));
    }
  });

  it("detects pool/spa occupancy clash on the rural specimen only", () => {
    assert.equal(findVesselClearanceIssues(buildPeiHouse()).length, 0);
    assert.equal(findVesselClearanceIssues(buildSlabCottage()).length, 0);
    const rural = findVesselClearanceIssues(buildRuralPoolHouse());
    assert.ok(rural.length >= 1, "rural pool and hot tub must still fail vessel clearance");
  });

  it("findSpatialIssues unions both classes", () => {
    const kinds = new Set(findSpatialIssues(buildRuralPoolHouse()).map((i) => i.kind));
    assert.ok(kinds.has("SHEET_COVERS_OPENING"));
    assert.ok(kinds.has("VESSEL_CLEARANCE"));
  });
});
