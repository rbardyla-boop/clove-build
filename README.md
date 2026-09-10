# Clove Build Lab

Clove Build Lab is an open-source browser laboratory for learning how buildings go together.

The long-term goal is to let learners disassemble, construct, inspect and safely break realistic buildings while tracing important claims to building science, trade practice and jurisdiction-specific rules.

v0.1 is deliberately narrow: one PEI-oriented Part 9 demonstration house, foundation and wood framing, one construction timeline, one reusable exploded-view engine, one Break It lesson, and a small deterministic rule/provenance system.

It is an educational prototype, not a permit approval service or substitute for a qualified professional or authority having jurisdiction.

## What v0.1 proves

A first-time user can orbit a recognisable house, explode it globally or by assembly, scrub construction stages, inspect members, remove parts in Break It, run deterministic checks (PASS / FAIL / MISSING INFORMATION / UNCERTAIN), and reset.

## Run

This repository is set up for the hosted preview. Locally, after `npm install`:

```
npm run dev
```

## Test

```
npm run test:clove
```

Open **Ryan Test** in the app and walk A–J. **Copy test results** into the next development conversation.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md). The building graph is the source of truth. The renderer only projects it. Jobsite capture and plan ingest exist only as adapter seams — they are not implemented.

## Rules and provenance

See [RULE_MODEL.md](RULE_MODEL.md) and [SOURCE_POLICY.md](SOURCE_POLICY.md). Most executable construction rules are Clove educational demonstration rules. PEI’s NBC 2020 adoption is verified at the jurisdiction-pack level. NBC clause text is not copied.

## Licence

Original Clove software: AGPL-3.0 (see [LICENSE](LICENSE)). Regulatory materials and third-party packages are excluded from that grant ([THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES)).

## Known limitations

- No structural finite-element analysis; the house does not “collapse.”
- No plumbing, electrical, HVAC, drywall or finishes.
- No IFC round-trip (adapter interface only).
- No jobsite capture or as-built evidence (adapter interface only).
- Desktop is the acceptance target.
- A 3D laboratory is not fully accessible; keyboard exists for primary controls, remaining limits are listed in ARCHITECTURE.md.

## Human test

Open the app → **Ryan Test** → complete A–J → **Copy test results**.
