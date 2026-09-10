import type { Rule } from "@/crates/rule-engine/types";
import { reachable } from "@/crates/system-graph/trace";
import { findClashes } from "@/crates/clash/engine";
import { findRoutingIssues } from "@/crates/routing/engine";
import { buildPeiHouse } from "@/specimen/pei-part9-house";

const DEMO = {
  authority: "EDUCATIONAL_DEMO_RULE" as const,
  sourceIds: ["clove-demo-pack"],
  wording: "executable-logic-only" as const,
  verification: "demo-only" as const,
};

const SCIENCE = {
  authority: "BUILDING_SCIENCE" as const,
  sourceIds: ["clove-demo-pack"],
  wording: "executable-logic-only" as const,
  verification: "demo-only" as const,
};

export const DEMO_PACK_VERSION = "0.2.0";

function graphFor(ctx: { graph?: ReturnType<typeof buildPeiHouse> }, lookup?: { has: (id: string) => boolean }) {
  void lookup;
  return ctx.graph ?? buildPeiHouse();
}

export const demoRules: Rule[] = [
  {
    id: "DEMO-LOADPATH-001",
    title: "Required support still present",
    packVersion: DEMO_PACK_VERSION,
    domain: "structure",
    provenance: DEMO,
    authorityLabel: "Clove educational demonstration rule — not a representation of an NBC clause",
    evaluate: (ctx, lookup) => {
      const failed: string[] = [];
      const all = [
        ...lookup.idsByType("header"),
        ...lookup.idsByType("jack-stud"),
        ...lookup.idsByType("floor-joist"),
        ...lookup.idsByType("beam"),
        ...lookup.idsByType("column"),
        ...lookup.idsByType("sill-plate"),
        ...lookup.idsByType("rafter"),
      ];
      for (const id of all) {
        if (lookup.isRemoved(id)) continue;
        if (!lookup.required(id) && lookup.typeOf(id) !== "header") continue;
        for (const support of lookup.supportedBy(id)) {
          if (lookup.isRemoved(support)) failed.push(id, support);
        }
      }
      const unique = [...new Set(failed)];
      if (unique.length === 0) {
        return {
          verdict: "PASS",
          componentIds: [],
          inputs: { removed: ctx.removedIds.length },
          reason: "Every still-present dependency-critical member has its modelled supports.",
          assumption: "This checks the specimen graph, not structural capacity.",
        };
      }
      return {
        verdict: "FAIL",
        componentIds: unique,
        inputs: { removed: ctx.removedIds.length, broken: unique.length },
        reason: "A required support dependency has been intentionally removed, so the modelled load path is incomplete.",
        assumption: "Graph integrity is not a substitute for engineering analysis.",
      };
    },
  },
  {
    id: "DEMO-OPENING-001",
    title: "Window / door opening assembly complete",
    packVersion: DEMO_PACK_VERSION,
    domain: "structure",
    provenance: DEMO,
    authorityLabel: "Clove educational demonstration rule — not a permit determination",
    evaluate: (_ctx, lookup) => {
      const headers = lookup.idsByType("header");
      const missing: string[] = [];
      const affected: string[] = [];
      for (const h of headers) {
        const still = !lookup.isRemoved(h);
        const supports = lookup.supportedBy(h);
        const jacksGone = supports.filter((id) => lookup.isRemoved(id));
        if (!still || jacksGone.length) {
          missing.push(h, ...jacksGone);
          affected.push(h, ...supports);
        }
      }
      const unique = [...new Set(affected)];
      if (unique.length === 0 || missing.length === 0) {
        return {
          verdict: "PASS",
          componentIds: [],
          inputs: { headers: headers.length },
          reason: "Each modelled header still exists and still bears on its jack studs.",
        };
      }
      return {
        verdict: "FAIL",
        componentIds: [...new Set(missing)],
        inputs: { headers: headers.length },
        reason: "Opening assembly dependency incomplete — a header and/or its jack studs were removed.",
        assumption: "The lesson is topological: the header is modelled as sitting on the jacks.",
      };
    },
  },
  {
    id: "DEMO-SILL-001",
    title: "Sill remains on the foundation path",
    packVersion: DEMO_PACK_VERSION,
    domain: "foundation",
    provenance: DEMO,
    authorityLabel: "Clove educational demonstration rule",
    evaluate: (_ctx, lookup) => {
      const sills = lookup.idsByType("sill-plate");
      const gone = sills.filter((id) => lookup.isRemoved(id));
      if (gone.length === 0) {
        return {
          verdict: "PASS",
          componentIds: [],
          inputs: { sills: sills.length },
          reason: "All modelled sill plates remain. Floor members still have a wood-to-concrete transition in the graph.",
        };
      }
      return {
        verdict: "FAIL",
        componentIds: gone,
        inputs: { sills: sills.length, removed: gone.length },
        reason: "A sill plate was removed. In this specimen the sill is the required transition from foundation to floor framing.",
      };
    },
  },
  {
    id: "NBC-SNOW-001",
    title: "Roof snow load / rafter capacity",
    packVersion: DEMO_PACK_VERSION,
    domain: "structure",
    provenance: {
      authority: "UNKNOWN",
      sourceIds: ["nrc-nbc-2020"],
      wording: "none",
      verification: "unverified",
    },
    authorityLabel: "Not evaluated — climatic data and licensed span tables are absent",
    evaluate: () => ({
      verdict: "MISSING_INFORMATION",
      componentIds: [],
      inputs: { snowLoadKPa: null, rafterGrade: null, spanTables: null },
      reason:
        "This specimen does not contain PEI climatic snow load, lumber grade, or licensed NBC span tables. Rafter size cannot be determined here.",
      assumption: "Absence of data is reported as MISSING INFORMATION rather than a guessed PASS/FAIL.",
      sourceRefs: ["nrc-nbc-2020"],
    }),
  },
  {
    id: "LUMBER-GRADE-001",
    title: "Sill plate species and grade",
    packVersion: DEMO_PACK_VERSION,
    domain: "structure",
    provenance: {
      authority: "INFERENCE",
      sourceIds: [],
      wording: "none",
      verification: "unverified",
    },
    authorityLabel: "Uncertain — specimen does not specify grade",
    evaluate: (_ctx, lookup) => {
      const sills = lookup.idsByType("sill-plate");
      return {
        verdict: "UNCERTAIN",
        componentIds: sills,
        inputs: { species: null, grade: null, treatment: "labelled treated, specification unknown" },
        reason:
          "Sill plates are modelled as preservative-treated lumber, but species, grade, and treatment specification are not in the graph. Whether they satisfy an applicable provision cannot be decided.",
        assumption: "Visual colour is not evidence of compliance.",
      };
    },
  },
  {
    id: "PEI-NBC2025-001",
    title: "Whether NBC 2025 applies in PEI on the project date",
    packVersion: DEMO_PACK_VERSION,
    domain: "jurisdiction",
    provenance: {
      authority: "OFFICIAL_REGULATION",
      sourceIds: ["cbhcc-pt-adoption", "nrc-publications", "pei-news-2024-03-08"],
      wording: "paraphrased",
      verification: "provisional",
    },
    authorityLabel: "Jurisdiction fact — adoption of NBC 2025 in PEI is not verified",
    evaluate: (ctx) => ({
      verdict: "UNCERTAIN",
      componentIds: [],
      inputs: {
        projectDate: ctx.projectDate,
        verifiedPeiNbc2020From: "2024-03-31",
        nrcListsNbc2025: true,
        peiNbc2025Instrument: null,
      },
      reason:
        "PEI’s verified adoption instrument in this pack is NBC 2020 (enforced 31 March 2024). NRC publishes NBC 2025, but no PEI 2025 adoption instrument was verified on retrieval. The applicable edition on the project date is therefore uncertain.",
      assumption: "This application will not infer that a newer national edition is in force locally.",
      sourceRefs: ["cbhcc-pt-adoption", "nrc-publications"],
    }),
  },
  {
    id: "PLUMB-TOPOLOGY-001",
    title: "Plumbing fixture reaches the building drain",
    packVersion: DEMO_PACK_VERSION,
    domain: "plumbing",
    provenance: DEMO,
    authorityLabel: "Clove educational demonstration rule — topology, not an NPC clause",
    evaluate: (ctx) => {
      const graph = graphFor(ctx);
      const sys = graph.systems.find((s) => s.trade === "plumbing");
      if (!sys) {
        return {
          verdict: "MISSING_INFORMATION",
          componentIds: [],
          inputs: {},
          reason: "No plumbing system graph is present.",
        };
      }
      const fixtures = ["plumbing.fixture.sink.bath", "plumbing.fixture.toilet.bath", "plumbing.fixture.tub.bath", "plumbing.fixture.sink.kitchen"];
      const drain = "plumbing.dwv.building-drain.001";
      const broken = fixtures.filter((id) => !reachable(sys, id, drain, ctx.removedIds, ["drain"]));
      if (broken.length === 0) {
        return {
          verdict: "PASS",
          componentIds: [],
          inputs: { fixtures: fixtures.length },
          reason: "Every modelled fixture still reaches the building drain through the DWV graph.",
          assumption: "This is schematic topology, not hydraulic sizing or an NPC trap-arm table.",
        };
      }
      return {
        verdict: "FAIL",
        componentIds: broken,
        inputs: { broken: broken.length },
        reason: "A fixture no longer reaches the building drain. The drain/waste network was cut in this specimen.",
        assumption: "A topology failure is not automatically a regulatory determination.",
      };
    },
  },
  {
    id: "PLUMB-SUPPLY-001",
    title: "Fixtures still reach a water source",
    packVersion: DEMO_PACK_VERSION,
    domain: "plumbing",
    provenance: DEMO,
    authorityLabel: "Clove educational demonstration rule — topology, not pipe sizing",
    evaluate: (ctx) => {
      const graph = graphFor(ctx);
      const sys = graph.systems.find((s) => s.trade === "plumbing")!;
      const coldSrc = "plumbing.supply.cold.service.001";
      const fixtures = ["plumbing.fixture.sink.bath", "plumbing.fixture.sink.kitchen", "plumbing.fixture.tub.bath", "plumbing.fixture.toilet.bath"];
      const broken = fixtures.filter((id) => !reachable(sys, id, coldSrc, ctx.removedIds, ["cold"]));
      if (broken.length === 0) {
        return {
          verdict: "PASS",
          componentIds: [],
          inputs: { fixtures: fixtures.length },
          reason: "Cold-water topology still reaches the modelled fixtures.",
          assumption: "Flow visualization is schematic. No fixture-unit calculation is performed.",
        };
      }
      return {
        verdict: "FAIL",
        componentIds: broken,
        inputs: { broken: broken.length },
        reason: "A fixture is disconnected from the cold-water service in the system graph.",
      };
    },
  },
  {
    id: "PLUMB-NPC-TEXT-001",
    title: "National Plumbing Code trap-arm / vent sizing",
    packVersion: DEMO_PACK_VERSION,
    domain: "plumbing",
    provenance: {
      authority: "UNKNOWN",
      sourceIds: ["pei-plumbing-reg", "cbhcc-pt-adoption"],
      wording: "none",
      verification: "unverified",
    },
    authorityLabel: "Not evaluated — NPC 2020 text is not licensed to this project",
    evaluate: () => ({
      verdict: "MISSING_INFORMATION",
      componentIds: [],
      inputs: { npcEdition: "2020", peiAdoption: "verified as family, not as clause text" },
      reason:
        "PEI adopted the National Plumbing Code of Canada 2020 (A Code for Plumbing Services Regulations; CBHCC table, enforcement 31 March 2024). Exact NPC trap, vent and sizing predicates are not encoded because the code text is not licensed for reproduction here.",
      assumption: "Adoption of a code family is not a substitute for a verified clause.",
      sourceRefs: ["pei-plumbing-reg", "cbhcc-pt-adoption"],
    }),
  },
  {
    id: "ELEC-TOPOLOGY-001",
    title: "Devices still reach the panel",
    packVersion: DEMO_PACK_VERSION,
    domain: "electrical",
    provenance: DEMO,
    authorityLabel: "Clove educational demonstration rule — topology / state visualization, not a CEC inspection",
    evaluate: (ctx) => {
      const graph = graphFor(ctx);
      const sys = graph.systems.find((s) => s.trade === "electrical")!;
      const panel = "electrical.panel.main";
      const devices = [
        "electrical.device.receptacle.front.001",
        "electrical.device.receptacle.kitchen.001",
        "electrical.device.receptacle.bath.001",
        "electrical.device.luminaire.front.001",
        "electrical.device.luminaire.bath.001",
      ];
      const broken = devices.filter((id) => !reachable(sys, id, panel, ctx.removedIds, ["circuit"]));
      if (broken.length === 0) {
        return {
          verdict: "PASS",
          componentIds: [],
          inputs: { devices: devices.length },
          reason: "Each watched device still has a circuit path to the panel.",
          assumption: "Energize view is topology, not a short-circuit or voltage-drop study.",
        };
      }
      return {
        verdict: "FAIL",
        componentIds: broken,
        inputs: { broken: broken.length },
        reason: "A device is disconnected from the panel in the circuit graph.",
        assumption: "This is a teaching topology cut. It is not permission to bypass protection in a real building.",
      };
    },
  },
  {
    id: "ELEC-CEC-TEXT-001",
    title: "Canadian Electrical Code device and protection rules",
    packVersion: DEMO_PACK_VERSION,
    domain: "electrical",
    provenance: {
      authority: "UNKNOWN",
      sourceIds: ["csa-cec-pei-ref", "canlii-ec757-18"],
      wording: "none",
      verification: "unverified",
    },
    authorityLabel: "Not evaluated — CEC 2024 text is copyrighted and is not reproduced here",
    evaluate: () => ({
      verdict: "MISSING_INFORMATION",
      componentIds: [],
      inputs: { cecEdition: "2024 Part I 26th", peiEffective: "October 2024 (CSA AHJ listing / EC757/18 as amended)" },
      reason:
        "PEI has adopted the 2024 Canadian Electrical Code, Part I, Twenty-sixth Edition, with PEI amendments in Electrical Inspection and Code Regulations. Clause-level CEC requirements are not encoded. No inspection approval is offered.",
      assumption: "A PEI amendment about permits or service masts is not inferred into a device-level PASS.",
      sourceRefs: ["csa-cec-pei-ref", "canlii-ec757-18"],
    }),
  },
  {
    id: "HVAC-TOPOLOGY-001",
    title: "Bathroom exhaust still reaches outdoors",
    packVersion: DEMO_PACK_VERSION,
    domain: "hvac",
    provenance: DEMO,
    authorityLabel: "Clove educational demonstration rule — schematic airflow, not CFD",
    evaluate: (ctx) => {
      const graph = graphFor(ctx);
      const sys = graph.systems.find((s) => s.trade === "hvac")!;
      const ok = reachable(sys, "hvac.exhaust.bath.001", "hvac.exhaust.bath.outlet", ctx.removedIds, ["exhaust"]);
      if (ok) {
        return {
          verdict: "PASS",
          componentIds: [],
          inputs: {},
          reason: "Bathroom exhaust still traces to an exterior outlet.",
          assumption: "Airflow animation is conceptual. Exhaust rates are not calculated.",
        };
      }
      return {
        verdict: "FAIL",
        componentIds: ["hvac.exhaust.bath.001", "hvac.exhaust.bath.duct", "hvac.exhaust.bath.outlet"],
        inputs: {},
        reason: "The bathroom exhaust path is broken in the system graph.",
      };
    },
  },
  {
    id: "HVAC-SUPPLY-001",
    title: "Supply terminals still reach the air handler",
    packVersion: DEMO_PACK_VERSION,
    domain: "hvac",
    provenance: DEMO,
    authorityLabel: "Clove educational demonstration rule",
    evaluate: (ctx) => {
      const graph = graphFor(ctx);
      const sys = graph.systems.find((s) => s.trade === "hvac")!;
      const indoor = "hvac.heatpump.indoor.001";
      const terminals = ["hvac.terminal.front.001", "hvac.terminal.bath.001", "hvac.terminal.kitchen.001"];
      const broken = terminals.filter((id) => !reachable(sys, id, indoor, ctx.removedIds, ["air-supply"]));
      if (broken.length === 0) {
        return {
          verdict: "PASS",
          componentIds: [],
          inputs: { terminals: terminals.length },
          reason: "Supply terminals still connect to the indoor unit.",
        };
      }
      return {
        verdict: "FAIL",
        componentIds: broken,
        inputs: { broken: broken.length },
        reason: "A supply terminal is disconnected from the air handler.",
      };
    },
  },
  {
    id: "ENV-FLASHING-001",
    title: "Teaching-window sill flashing present",
    packVersion: DEMO_PACK_VERSION,
    domain: "envelope",
    provenance: SCIENCE,
    authorityLabel: "Building-science demonstration — common assembly, not the only legal wall",
    evaluate: (_ctx, lookup) => {
      const id = "envelope.window.front.001.flashing";
      if (!lookup.isRemoved(id) && lookup.has(id)) {
        return {
          verdict: "PASS",
          componentIds: [],
          inputs: {},
          reason: "The teaching window still has its sill-flashing component.",
          assumption: "This is a water-control layer in the specimen, not a copied NBC flashing schedule.",
        };
      }
      return {
        verdict: "FAIL",
        componentIds: [id],
        inputs: {},
        reason: "Sill flashing was removed from the teaching window. Water-control continuity of this specimen is broken.",
      };
    },
  },
  {
    id: "THERM-AIR-001",
    title: "Front-wall air-control layer present",
    packVersion: DEMO_PACK_VERSION,
    domain: "thermal",
    provenance: SCIENCE,
    authorityLabel: "Building-science visualization — not a blower-door or hygrothermal result",
    evaluate: (_ctx, lookup) => {
      const id = "thermal.wall.front.air-barrier";
      if (!lookup.isRemoved(id) && lookup.has(id)) {
        return {
          verdict: "PASS",
          componentIds: [],
          inputs: {},
          reason: "The front-wall air-control layer is still in the graph.",
          assumption: "Continuity is demonstrated, not measured. No ACH50 is claimed.",
        };
      }
      return {
        verdict: "FAIL",
        componentIds: [id],
        inputs: {},
        reason: "The teaching wall’s air-control layer was removed.",
      };
    },
  },
  {
    id: "FINISH-SEQUENCE-001",
    title: "Drywall does not precede the modelled close-in dependencies",
    packVersion: DEMO_PACK_VERSION,
    domain: "finish",
    provenance: {
      authority: "PROJECT_MODEL_ASSUMPTION",
      sourceIds: ["clove-demo-pack"],
      wording: "executable-logic-only",
      verification: "demo-only",
    },
    authorityLabel: "Project construction sequence of this specimen — not a universal legal order",
    evaluate: (_ctx, lookup) => {
      const drywall = lookup.idsByType("drywall");
      const still = drywall.filter((id) => !lookup.isRemoved(id));
      if (still.length === 0) {
        return {
          verdict: "PASS",
          componentIds: [],
          inputs: { drywall: 0 },
          reason: "No drywall remains; sequence is not in question.",
        };
      }
      return {
        verdict: "PASS",
        componentIds: [],
        inputs: { drywall: still.length },
        reason: "Drywall is present as the close-in of THIS specimen. Sequence is PROJECT_CONSTRUCTION_SEQUENCE, not a mandated inspection calendar.",
      };
    },
  },
  {
    id: "CROSS-CLASH-001",
    title: "Obvious geometric clashes among services and structure",
    packVersion: DEMO_PACK_VERSION,
    domain: "cross-trade",
    provenance: DEMO,
    authorityLabel: "Project geometric fact — not a code violation",
    evaluate: (ctx) => {
      const graph = graphFor(ctx);
      const clashes = findClashes(graph, ctx.removedIds).filter((c) => c.kind === "GEOMETRIC_CLASH");
      if (clashes.length === 0) {
        return {
          verdict: "PASS",
          componentIds: [],
          inputs: { clashes: 0 },
          reason: "No unregistered solid-volume clashes were detected between services and framing/foundation.",
          assumption: "Absence of an AABB clash is not a structural or firestopping approval.",
        };
      }
      return {
        verdict: "FAIL",
        componentIds: [...new Set(clashes.flatMap((c) => [c.a, c.b]))].slice(0, 12),
        inputs: { clashes: clashes.length },
        reason: clashes[0]!.reason,
      };
    },
  },
  {
    id: "CROSS-ROUTE-001",
    title: "Distribution runs stay out of occupied living space",
    packVersion: DEMO_PACK_VERSION,
    domain: "cross-trade",
    provenance: {
      authority: "TRADE_PRACTICE" as const,
      sourceIds: ["clove-demo-pack"],
      wording: "executable-logic-only" as const,
      verification: "demo-only" as const,
    },
    authorityLabel: "Trade practice of this specimen — not an NPC/CEC clause",
    evaluate: (ctx) => {
      const graph = graphFor(ctx);
      const runs = findRoutingIssues(graph, ctx.removedIds).filter((c) => c.kind === "OCCUPIED_SPACE");
      if (runs.length === 0) {
        return {
          verdict: "PASS",
          componentIds: [],
          inputs: { occupiedRuns: 0 },
          reason: "No long supply, DWV, vent, cable or duct run was found through occupied living space.",
          assumption: "This is a routing envelope check (above subfloor, below ceiling, not in a wall). It is not a licensed code table.",
        };
      }
      return {
        verdict: "FAIL",
        componentIds: [...new Set(runs.map((r) => r.a))].slice(0, 12),
        inputs: { occupiedRuns: runs.length },
        reason: runs[0]!.reason,
        assumption: "Water lines belong under the subfloor, in a wall, or in a ceiling/attic — not across the room.",
      };
    },
  },
  {
    id: "CROSS-ROUTE-002",
    title: "Service routes are connected, hosted, and spatially possible",
    packVersion: DEMO_PACK_VERSION,
    domain: "cross-trade",
    provenance: DEMO,
    authorityLabel: "Project geometric/system fact — not a code violation",
    evaluate: (ctx) => {
      const graph = graphFor(ctx);
      const hits = findRoutingIssues(graph, ctx.removedIds).filter((c) =>
        ["SOLID_HOST_COLLISION", "MISSING_PENETRATION", "DISCONNECTED_ROUTE", "FLOATING_COMPONENT", "IMPOSSIBLE_TRANSITION", "ROUTE_OUTSIDE_ALLOWED_ZONE"].includes(c.kind),
      );
      if (hits.length === 0) {
        return {
          verdict: "PASS",
          componentIds: [],
          inputs: { hits: 0 },
          reason: "No disconnected, floating, unpenetrated, or spatially-impossible service routes were detected.",
          assumption: "This is a routing engine result, not an NPC/CEC determination.",
        };
      }
      return {
        verdict: "FAIL",
        componentIds: [...new Set(hits.flatMap((h) => [h.a, h.b]))].slice(0, 12),
        inputs: { hits: hits.length, kind: hits[0]!.kind },
        reason: hits[0]!.reason,
      };
    },
  },
  {
    id: "JOIST-BORE-001",
    title: "Cross-joist cable bores are not modelled",
    packVersion: DEMO_PACK_VERSION,
    domain: "electrical",
    provenance: {
      authority: "TRADE_PRACTICE",
      sourceIds: ["clove-demo-pack"],
      wording: "executable-logic-only",
      verification: "unverified",
    },
    authorityLabel: "Plausible routing — not a verified joist penetration",
    evaluate: (_ctx, lookup) => {
      const ids = lookup.idsByTag("joist-bore-unverified").filter((id) => !lookup.isRemoved(id));
      return {
        verdict: "MISSING_INFORMATION",
        componentIds: ids,
        inputs: {
          crossJoistRuns: ids.length,
          modelledBoreDiameter: null,
          remainingWood: null,
          protectionPlate: null,
          manufacturedJoistRestrictions: null,
        },
        reason:
          "These cables are geometrically L-shaped in the floor cavity instead of a diagonal through the room. That is plausible routing. Bore location, diameter, remaining wood, hole protection, and any manufactured-joist drilling restrictions are not in the graph, so this is not a verified installation.",
        assumption: "A sensible-looking line is not a bored-hole design.",
      };
    },
  },
  {
    id: "HVAC-HUNG-001",
    title: "Hung basement trunks: clearance and support not evaluated",
    packVersion: DEMO_PACK_VERSION,
    domain: "hvac",
    provenance: DEMO,
    authorityLabel: "Plausible routing — not a verified mechanical installation",
    evaluate: (_ctx, lookup) => {
      const ids = ["hvac.duct.supply.main", "hvac.duct.return.main", "hvac.duct.supply.riser"].filter((id) => lookup.has(id) && !lookup.isRemoved(id));
      return {
        verdict: "MISSING_INFORMATION",
        componentIds: ids,
        inputs: { strapSpacing: null, remainingHeadroom: null, ductSizeVerified: false },
        reason:
          "Supply and return trunks hang below the joists rather than occupying the 2×10 joist cavity. That is the more believable place for a trunk this size. Strap spacing, remaining basement headroom, and duct sizing are not evaluated.",
        assumption: "Hanging a duct under the joists is a routing fact, not a mechanical design.",
      };
    },
  },
  {
    id: "WET-WALL-001",
    title: "Wet wall cavity is deep enough for the soil stack",
    packVersion: DEMO_PACK_VERSION,
    domain: "cross-trade",
    provenance: DEMO,
    authorityLabel: "Clove educational demonstration rule — cavity vs pipe, not NPC fittings",
    evaluate: (ctx) => {
      const graph = graphFor(ctx);
      const wall = graph.components["assembly.wall.bath"];
      const stack = graph.components["plumbing.dwv.stack.001"];
      if (!wall || !stack) {
        return {
          verdict: "MISSING_INFORMATION",
          componentIds: [],
          inputs: { wall: Boolean(wall), stack: Boolean(stack) },
          reason: "Wet wall or soil stack is not in the graph.",
        };
      }
      const wallDepth = Math.min(wall.geometry.size[0], wall.geometry.size[2]);
      const stackDia = Math.min(stack.geometry.size[0], stack.geometry.size[2]);
      const leftover = wallDepth - stackDia;
      if (leftover >= 0.02) {
        return {
          verdict: "PASS",
          componentIds: [wall.id, stack.id],
          inputs: { wallDepthMm: Math.round(wallDepth * 1000), stackDiaMm: Math.round(stackDia * 1000), leftoverMm: Math.round(leftover * 1000) },
          reason: "The bathroom wet wall is a 2×6 (140 mm) plumbing wall. The modelled 75 mm stack fits the cavity with leftover depth. Fittings, firestopping and insulation are not modelled.",
          assumption: "Cavity-versus-pipe is not a substitute for a fitting layout.",
        };
      }
      return {
        verdict: "FAIL",
        componentIds: [wall.id, stack.id],
        inputs: { wallDepthMm: Math.round(wallDepth * 1000), stackDiaMm: Math.round(stackDia * 1000), leftoverMm: Math.round(leftover * 1000) },
        reason: "The wet wall is thinner than the soil stack plus a 20 mm leftover. A 2×4 (89 mm) wall is not a credible host for a 75 mm stack.",
        assumption: "This is a physical-fit check on modelled boxes, not an NPC clause.",
      };
    },
  },
  {
    id: "DWV-SLOPE-001",
    title: "Horizontal DWV fall is not modelled",
    packVersion: DEMO_PACK_VERSION,
    domain: "plumbing",
    provenance: {
      authority: "TRADE_PRACTICE",
      sourceIds: ["clove-demo-pack"],
      wording: "executable-logic-only",
      verification: "unverified",
    },
    authorityLabel: "Plausible topology — not a verified drain installation",
    evaluate: (ctx) => {
      const graph = graphFor(ctx);
      const level: string[] = [];
      for (const c of Object.values(graph.components)) {
        if (c.type !== "pipe-dwv") continue;
        const [sx, sy, sz] = c.geometry.size;
        const horiz = Math.max(sx, sz);
        if (horiz < 0.5) continue;
        if (horiz < sy * 1.5) continue;
        level.push(c.id);
      }
      return {
        verdict: "MISSING_INFORMATION",
        componentIds: level,
        inputs: { levelRuns: level.length, modelledFall: null, typicalEducationalFall: "1 in 50, not encoded" },
        reason:
          "Horizontal DWV runs are modelled level. Fall/slope is not in the graph, so these drains are not verified as buildable. Topology (what connects to what) is still a project fact; grade is not.",
        assumption: "A level box is not a 1-in-50 drain.",
      };
    },
  },
  {
    id: "PEI-ENERGY-PATH-001",
    title: "Which energy path applies to this Part 9 house",
    packVersion: DEMO_PACK_VERSION,
    domain: "jurisdiction",
    provenance: {
      authority: "OFFICIAL_REGULATION",
      sourceIds: ["cbhcc-pt-adoption", "pei-news-2024-03-08", "nrc-nbc-2020"],
      wording: "paraphrased",
      verification: "provisional",
    },
    authorityLabel: "Jurisdiction fact — NECB 2020 is adopted in PEI, but is not assumed as this house’s compliance path",
    evaluate: () => ({
      verdict: "MISSING_INFORMATION",
      componentIds: [],
      inputs: {
        peiNbc2020: true,
        peiNecb2020: true,
        energyTier: "Energy Performance Tier 1 (CBHCC table, Aug 2024)",
        chosenPath: null,
        part9House: true,
      },
      reason:
        "PEI adopted NBC 2020 and NECB 2020 (Energy Performance Tier 1) effective 31 March 2024. For a detached Part 9 house the usual energy provisions live in NBC Section 9.36; NECB is an alternative acceptable solution, not automatically this specimen’s path. No RSI targets, occupancy schedule or modelled energy use are in the graph, so compliance cannot be determined.",
      assumption: "Adopting NECB provincially does not mean every house is evaluated under NECB.",
      sourceRefs: ["cbhcc-pt-adoption", "pei-news-2024-03-08"],
    }),
  },
  {
    id: "PEI-NPC2025-001",
    title: "Whether NPC 2025 applies in PEI on the project date",
    packVersion: DEMO_PACK_VERSION,
    domain: "jurisdiction",
    provenance: {
      authority: "OFFICIAL_REGULATION",
      sourceIds: ["nrc-publications", "pei-plumbing-reg"],
      wording: "paraphrased",
      verification: "provisional",
    },
    authorityLabel: "Jurisdiction fact — NPC 2025 publication is not PEI adoption",
    evaluate: () => ({
      verdict: "UNCERTAIN",
      componentIds: [],
      inputs: { nrcListsNpc2025: true, peiNpc2025Instrument: null, verifiedPeiNpc2020From: "2024-03-31" },
      reason:
        "NRC has published a 2025 model plumbing code generation. PEI’s verified plumbing adoption instrument in this pack remains NPC 2020. Publication is not adoption.",
      sourceRefs: ["nrc-publications", "pei-plumbing-reg"],
    }),
  },
];
