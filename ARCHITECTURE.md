# Architecture

v0.1 crate map:

```
src/crates/building-graph     canonical planned semantic model
src/crates/geometry           lumber sizes and display units
src/crates/explode            pure explode offsets
src/crates/construction-sequence
src/crates/session            commands + zustand store
src/crates/renderer           Three.js projection of the graph
src/crates/inspect            inspector formatting
src/crates/break-it           challenge metadata
src/crates/rule-engine        deterministic predicates
src/crates/jurisdiction       pack selection by date
src/crates/provenance         authority categories
src/crates/persistence        documented local behaviour
src/crates/exchange           future IFC round-trip (empty)
src/crates/ingest             plan intake → candidate (unimplemented)
src/crates/observation        reality capture + evidence (unimplemented)
src/crates/code-watch         future watch pipeline (interface)
src/crates/test-receipts      live + last-run receipt
src/crates/ui                 overlay chrome
src/specimen/pei-part9-house  parametric PEI demo house
src/rule-packs/demo           executable educational rules
src/rule-packs/pei            jurisdiction pack
research/source-manifest.json
```

One canonical `BuildingGraph`. It is the **planned** house. React holds UI/session overlay (`removedIds`, explode, stage). Three.js meshes are a projection. Reset rebuilds overlay against the frozen baseline.

Commands are explicit (`SELECT_COMPONENT`, `SET_EXPLODE`, `REMOVE_COMPONENT`, `RUN_CHECK`, `RESET_SPECIMEN`, …).

Members keep stable semantic ids (`assembly.wall.front.stud.00`, headers, joists, foundation walls) — never `mesh284`. That is what lets a later capture say “candidate header observed here” instead of matching anonymous geometry.

## Rendering

Raw Three.js (not R3F) because React 19.3 rejected `@react-three/fiber`’s peer range, and because the graph must not live inside the scene graph.

## Accessibility limits (honest)

Keyboard: arrows scrub stages, E explode, X x-ray, Delete removes in Break It, Escape clears selection. Buttons are labelled. The 3D picker is pointer-first. Screen-reader users get inspector text for the selected member but cannot equivalently browse every joist. Reduced motion snaps camera moves.

## Persistence

Mutations reset on reload. Ryan Test marks persist in `localStorage`.

## v2 seams (unimplemented)

v1 teaches a planned house. After the Ryan Test, v2 may overlay jobsite evidence. Do not collapse plan and reality into one graph.

Authoritative state, when it exists:

```
planned BuildingGraph
+ EvidenceRecord[] (observations)
+ deterministic assembly.dependencies
+ jurisdiction rule packs
```

Never:

```
LLM looked at pictures and sounded confident.
```

Intake:

```
unknown PDF / drawing / IFC
  → PlanIngestAdapter.ingest
  → BuildingGraphCandidate
  → acceptCandidate (integrity)
  → BuildingGraph
```

`BuildingExchangeAdapter` is IFC round-trip of an already-canonical graph. It is not a second ingest path.

Capture:

```
photos / video / 360 / LiDAR
  → RealityCaptureAdapter.reconstruct
  → ObservedScene (geometry, not semantics)
  → align to planned graph
  → EvidenceRecord[]
```

Evidence status is evidence-bounded:

`DIRECTLY_OBSERVED | MEASURED | AI_INFERRED | PLAN_ASSUMED | OCCLUDED | CONFLICTING | UNKNOWN`

There is no “AI accurate” status. `OCCLUDED` and `UNKNOWN` are valid terminal answers. `AI_INFERRED` is never a rule `PASS`. Claim `provenance.status` on a component is not site observation.

v1 implements none of this. The PEI specimen is already a `BuildingGraph`. `LabSnapshot.graph` is the plan. `constructionStage` is an educational scrubber, not percent-complete. `removedIds` is Break It, not demolition evidence.
