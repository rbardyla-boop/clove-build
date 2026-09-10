# Contributing to Clove Build Lab

Clove is a free, open-source educational construction laboratory. There is no paywall and no account gate.

## What you can contribute

- trade model / 3D component on the PEI house
- educational Break It challenge
- jurisdiction metadata (adoption dates, locators)
- original-wording rule predicate + tests
- accessibility improvement
- bug report with a failing seed or screenshot

## Regulatory contributions

Every regulatory contribution requires provenance. Use `src/crates/contrib/schema.ts`:

- jurisdiction, code family, edition, provision **identifier**
- authority class
- source URL and retrieval date
- inputs, predicate, **original explanation**
- test cases and verification state

**Do not commit NBC, NPC, NECB, CEC, or B149 wording** unless content rights are explicitly established. Free-to-read is not a redistribution licence.

A local `private-reference/` folder may hold PDFs you already have a right to possess. It is gitignored. The engine never reads it.

## Architecture rules

- One canonical `BuildingGraph`. Rendering is not truth.
- Overlay (Break It, TRACE, faults) must not rewrite the planned graph.
- Verdicts are only PASS / FAIL / MISSING_INFORMATION / UNCERTAIN.
- Unknown is a successful outcome when evidence is missing.
- Code Watch may snapshot metadata. It must never auto-activate production rules.

See `ARCHITECTURE.md`, `SOURCE_POLICY.md`, `RULE_MODEL.md`, `SCAR_TISSUE.md`.
