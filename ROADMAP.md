# Roadmap

v0.2.0 on `main` is the frozen public alpha.

v0.3 (`v0.3-construction-depth`) is an experimental test build. **Do not merge.** Feature work is frozen for a collection week.

Already recorded (do not treat as new):
- ENVELOPE-OPENING-001
- POOL-SPA-001

See `KNOWN_FAILURES.md`. Consolidation sprint after the week: dedupe feedback → repair physical/safety/model errors first → scar tissue → gauntlet → Ryan visual pass.

The Ryan Full-House Test A–Z is the human gate for a later public-utility tag.

- Additional verified PEI/NBC/NPC/CEC facts only with source rows and no copied code text
- Real IFC import behind `PlanIngestAdapter` → `BuildingGraphCandidate` → integrity, then `BuildingExchangeAdapter` round-trip
- CODE WATCH as a human-gated pack publisher, never an auto-rewriter
- Shadow rule pack (`src/crates/shadow-pack/`): original predicates + citation pointers; official text never shipped; local PDF folder is gitignored and unread by the engine
- Other provinces as additional jurisdiction packs, not conditionals in the UI

Do not start jobsite capture, blueprint AI, or permit submission before this house is proven.

Out of scope until the engine is proven: accounts, payments, chatbots, photo/video upload, blueprint ingestion, permit submission, FEM, CFD, hydraulic sizing, voltage-drop, VR, jobsite reconstruction, as-built twin, advertising.
