# Known failures — v0.3 experimental

v0.2.0 on `main` remains the frozen public alpha.

`v0.3-construction-depth` is a public **test build**. Do not merge. Do not treat a Check PASS as “this looks buildable.”

These defects are already recorded. Do not open them again as new feedback.

| Id | Bucket | Specimens | Status | Detector |
| --- | --- | --- | --- | --- |
| ENVELOPE-OPENING-001 | visual-modeling | PEI, slab, rural | OPEN | spatial `SHEET_COVERS_OPENING` |
| POOL-SPA-001 | visual-modeling | rural | OPEN | spatial `VESSEL_CLEARANCE` |

## Why a spatial layer, not a one-off patch

Both failures are the same class: components occupy space without knowing what else occupies that space.

- Envelope WRB/cladding are full-wall sheets. They cover door and window holes instead of being cut around the framed opening. AABB clash missed this because cladding sits *outboard* of the unit.
- Pool vessel and hot tub are two water features with no occupancy clearance. Volume overlap is not required for them to read as colliding.

The spatial crate (`src/crates/spatial/`) classifies occupancy (sheet / opening / vessel / solid / service) and asks face and clearance questions. New visual defects of the same class should become detectors there, not unique geometry hacks.

Geometry is **not** being repaired this freeze. When the consolidation sprint runs, repair occupancy first, then flip these tests from “still open” to “must not recur.”

## Feedback buckets for the freeze week

1. **physical-construction** — I would not actually build it like this.
2. **regulatory-authority** — Clove claims more than its evidence proves.
3. **usability-teaching** — The interface taught the wrong mental model, or I could not inspect it.
4. **visual-modeling** — It looks wrong on screen (uncut sheets, colliding meshes, washed-out X-ray).

Accumulate. Do not thrash the branch per comment.
