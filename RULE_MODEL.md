# Rule model

Verdicts are only `PASS`, `FAIL`, `MISSING_INFORMATION`, or `UNCERTAIN`.

An LLM does not decide compliance. Predicates run on the semantic graph plus jurisdiction/project date.

v0.1 rules:

| ID | Verdict intent | Authority |
| --- | --- | --- |
| DEMO-LOADPATH-001 | FAIL if a modelled support is removed | EDUCATIONAL_DEMO_RULE |
| DEMO-OPENING-001 | FAIL if header/jacks incomplete | EDUCATIONAL_DEMO_RULE |
| DEMO-SILL-001 | FAIL if a sill plate is removed | EDUCATIONAL_DEMO_RULE |
| NBC-SNOW-001 | always MISSING_INFORMATION (no climatic data / span tables) | UNKNOWN / unverified |
| LUMBER-GRADE-001 | UNCERTAIN (species/grade not in the graph) | INFERENCE |
| PEI-NBC2025-001 | UNCERTAIN whether NBC 2025 applies in PEI on the project date | OFFICIAL_REGULATION metadata, adoption of 2025 unverified |

Demo rules must never be labelled as law. The check drawer prints the authority category on every result.

Claim categories on components (required-by-code, trade-practice, educational-simplification, …) are stored separately from verdicts so they are not collapsed into one “correct” label.

## Evidence is not a verdict

If jobsite observations exist later, they are `EvidenceRecord`s beside the planned graph, not a new verdict kind and not a field on `BuildingComponent`.

Evidence status is evidence-bounded:

`DIRECTLY_OBSERVED | MEASURED | AI_INFERRED | PLAN_ASSUMED | OCCLUDED | CONFLICTING | UNKNOWN`

That list is not compliance. `AI_INFERRED` cannot become `PASS`. `OCCLUDED` and `UNKNOWN` are honest answers, not failures of the engine. The same `MISSING_INFORMATION` / `UNCERTAIN` rule verdicts remain the way checks report that something cannot be proven.
