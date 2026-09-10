# Try to break Clove

Clove Build Lab is a free, open-source browser laboratory. It is **not** a permit service.

**Frozen public alpha:** [v0.2.0](https://github.com/rbardyla-boop/clove-build/releases/tag/v0.2.0)  
**Experimental test build:** branch `v0.3-construction-depth` — three dwellings, not merged.

Feature work is frozen. Attack the houses. Accumulate findings. Do not expect a patch per comment.

## Already recorded — do not re-report

See [KNOWN_FAILURES.md](KNOWN_FAILURES.md).

- **ENVELOPE-OPENING-001** — envelope WRB/cladding covers door and window openings (all three dwellings).
- **POOL-SPA-001** — pool and hot-tub occupancy collide (rural specimen).

Both are spatial-occupancy defects. The engine now has a spatial awareness layer that detects them. Geometry is not being repaired this week.

## Four buckets

1. **Physical construction** — “I would not actually build it like this.”
2. **Regulatory / authority** — “Clove is claiming more than its evidence proves.”
3. **Usability / teaching** — “This taught me the wrong mental model,” or “I could not inspect it.”
4. **Visual / modeling** — “It looks wrong on screen.”

## How to report

Open a GitHub issue using one of:

- [Physical reality failure](https://github.com/rbardyla-boop/clove-build/issues/new?template=physical-reality.yml)
- [Authority / evidence failure](https://github.com/rbardyla-boop/clove-build/issues/new?template=authority-evidence.yml)
- [Usability failure](https://github.com/rbardyla-boop/clove-build/issues/new?template=usability.yml)
- [Visual / modeling defect](https://github.com/rbardyla-boop/clove-build/issues/new?template=visual-modeling.yml)

Include component / area, expected vs shown, why it appears wrong, screenshot if you can.

Source: https://github.com/rbardyla-boop/clove-build  
Release: https://github.com/rbardyla-boop/clove-build/releases/tag/v0.2.0
