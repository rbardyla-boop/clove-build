# Clove Build Lab

**Public Alpha v0.2.0** — a free, open-source, browser-based PEI Part 9 house you can build, disassemble, inspect, trace, break, and check across all major residential trades.

**[Try to break Clove](BREAK_CLOVE.md)** — find one thing you would not actually build, one rule that claims too much, or one part of the interface that teaches the wrong model.

Clove Build Lab is an open-source browser laboratory for learning how buildings go together.

The long-term goal is to let learners disassemble, construct, inspect and safely break realistic buildings while tracing important claims to building science, trade practice and jurisdiction-specific rules.

v0.2 is one PEI-oriented Part 9 demonstration house with **all major residential trades in the same canonical graph**: foundation, structure, envelope, plumbing, electrical, HVAC, thermal/control layers, and drywall/finish. One construction timeline. One explode/inspect grammar. One provenance ladder.

v0.3 is the public-utility deepening of that same house: semantic space zones, a cross-trade routing engine, control-layer traces, search, Show me why / Show me where, Code Watch metadata, and a shadow rule pack that never ships protected code text.

It is an educational prototype, not a permit approval service or substitute for a qualified professional or authority having jurisdiction.

## Runtime

Verified on **Node 22.x** (see `.nvmrc` and `package.json` `engines`). Multi-version support is not claimed.

## What v0.2 proves

A first-time user can orbit a finished house, peel it by trade, explode a wall and see finish → drywall → services → insulation → framing → envelope, scrub construction from foundation to complete, trace plumbing / electrical / HVAC topology, break a connection, run a whole-house check grouped by domain and authority class, and reset to the exact baseline.

## Run

```
npm ci
npm run dev
```

## Verify

The complete repository gate:

```
npm run verify
```

That is:

1. `npm test` — full test suite (platform/PWA tests + lib tests + Clove core + trade tests)
2. `npm run typecheck`
3. `npm run build`

`npm test` is the canonical complete test suite.

`npm run test:clove` is the Clove subset only. Do not report its count as the full repository result.

Open **Ryan Test** in the app and walk **A–Z**. **Copy full test receipt** into the next development conversation. A green automated gate is not a passed Ryan Full-House Test.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md). There is one `BuildingGraph`. Trade system graphs (plumbing, electrical, HVAC) reference those component IDs. Meshes are a projection. Session overlay (explode, trade layers, trace, Break It) never mutates the planned graph.

Jobsite capture and plan ingest exist only as adapter seams — they are not implemented.

## Rules and provenance

See [RULE_MODEL.md](RULE_MODEL.md) and [SOURCE_POLICY.md](SOURCE_POLICY.md).

- PEI building: NBC 2020 (Energy Performance Tier 1), enforced 31 March 2024 — verified as a code family, not as copied clauses.
- PEI plumbing: NPC 2020 via *A Code for Plumbing Services Regulations* — family verified; clause text not encoded.
- PEI electrical: CEC 2024 Part I, 26th edition, via Electrical Inspection and Code Regulations (EC757/18 as amended, 5 October 2024) — family verified; CEC text is not reproduced.
- Energy: NECB 2020 is adopted in PEI; it is **not** assumed as this Part 9 house’s compliance path. NBC 9.36 vs NECB is reported as MISSING_INFORMATION.
- NBC/NPC 2025: published nationally; PEI adoption is UNCERTAIN.

A topology FAIL is an educational demonstration rule, not an official prosecution.

## Licence

Original Clove software: AGPL-3.0 (see [LICENSE](LICENSE)). Regulatory materials and third-party packages are excluded from that grant ([THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES)).

## Known limitations

- No structural FEA; the house does not “collapse.”
- Plumbing flow is schematic, not hydraulic simulation.
- Electrical energize is topology / state visualization, not voltage-drop or short-circuit calculation.
- HVAC airflow is schematic, not CFD.
- Envelope control-layer view is building-science visualization, not hygrothermal analysis.
- No IFC round-trip (adapter interface only).
- No jobsite capture or as-built evidence (adapter interface only).
- Desktop is the acceptance target.
- A 3D laboratory is not fully accessible; keyboard exists for primary controls, remaining limits are listed in ARCHITECTURE.md.

## Human test

Open the app → **Ryan Test** → complete A–Z → **Copy full test receipt**.
