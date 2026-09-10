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

v0.2 additional rules:

| ID | Verdict intent | Authority |
| --- | --- | --- |
| PLUMB-TOPOLOGY-001 | FAIL if a fixture cannot reach the building drain | EDUCATIONAL_DEMO_RULE |
| PLUMB-SUPPLY-001 | FAIL if a fixture cannot reach the cold service | EDUCATIONAL_DEMO_RULE |
| PLUMB-NPC-TEXT-001 | always MISSING_INFORMATION (NPC text not licensed) | UNKNOWN |
| ELEC-TOPOLOGY-001 | FAIL if a watched device cannot reach the panel | EDUCATIONAL_DEMO_RULE |
| ELEC-CEC-TEXT-001 | always MISSING_INFORMATION (CEC text not reproduced) | UNKNOWN |
| HVAC-TOPOLOGY-001 | FAIL if bath exhaust cannot reach the outlet | EDUCATIONAL_DEMO_RULE |
| HVAC-SUPPLY-001 | FAIL if a supply terminal is cut from the air handler | EDUCATIONAL_DEMO_RULE |
| ENV-FLASHING-001 | FAIL if teaching-window sill flashing is removed | BUILDING_SCIENCE |
| THERM-AIR-001 | FAIL if front-wall air-control layer is removed | BUILDING_SCIENCE |
| FINISH-SEQUENCE-001 | documents PROJECT_CONSTRUCTION_SEQUENCE | PROJECT_MODEL_ASSUMPTION |
| CROSS-CLASH-001 | FAIL on unregistered service/structure AABB clash | EDUCATIONAL_DEMO_RULE |
| CROSS-ROUTE-001 | FAIL if a long distribution run occupies living space | TRADE_PRACTICE |
| CROSS-ROUTE-002 | FAIL on disconnected/floating/unpenetrated/impossible routes | EDUCATIONAL_DEMO_RULE |
| PEI-ENERGY-PATH-001 | MISSING_INFORMATION — NECB not assumed for this Part 9 house | OFFICIAL_REGULATION metadata |
| PEI-NPC2025-001 | UNCERTAIN — NPC 2025 publication ≠ PEI adoption | OFFICIAL_REGULATION metadata |

v0.3 additions: space-model zones, route segments, SHOW ME WHY/WHERE, semantic search, Code Watch (metadata only, never auto-activates), shadow contributions. Official NBC/NPC/CEC paragraphs are never distributed.

Demo rules must never be labelled as law. The check drawer prints the authority category on every result, grouped by domain.

Claim categories on components (required-by-code, trade-practice, educational-simplification, …) are stored separately from verdicts so they are not collapsed into one “correct” label.

## Evidence is not a verdict

If jobsite observations exist later, they are `EvidenceRecord`s beside the planned graph, not a new verdict kind and not a field on `BuildingComponent`.

Evidence status is evidence-bounded:

`DIRECTLY_OBSERVED | MEASURED | AI_INFERRED | PLAN_ASSUMED | OCCLUDED | CONFLICTING | UNKNOWN`

That list is not compliance. `AI_INFERRED` cannot become `PASS`. `OCCLUDED` and `UNKNOWN` are honest answers, not failures of the engine. The same `MISSING_INFORMATION` / `UNCERTAIN` rule verdicts remain the way checks report that something cannot be proven.
