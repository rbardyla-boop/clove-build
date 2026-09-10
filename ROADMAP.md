# Roadmap

Not a promise. v0.2 must earn the Ryan Trades Test before anything else.

- Human **Ryan Trades Test A–P** receipt before v2
- Additional verified PEI/NBC/NPC/CEC facts only with source rows and no copied code text
- Real IFC import behind `PlanIngestAdapter` → `BuildingGraphCandidate` → integrity, then `BuildingExchangeAdapter` round-trip
- CODE WATCH as a human-gated pack publisher, never an auto-rewriter
- Other provinces as additional jurisdiction packs, not conditionals in the UI

v0.2 (this branch) added plumbing, electrical, HVAC, envelope, thermal and finish **into the same house**. That work is done when the Ryan Trades Test is walked, not when the commit lands.

After the integrated house passes the Ryan Trades Test, the next product is not “AI looks at photos.” It is:

```
This is my actual house.
Show me what has been constructed, what differs,
what you cannot prove, what I should inspect, and what comes next.
```

That work sits on the v1 seams already reserved:

- `PlanIngestAdapter` / `BuildingGraphCandidate`
- `RealityCaptureAdapter` / `ObservedScene`
- `EvidenceRecord` + `ObservedBuildingState` (plan + observations, never a rewritten graph)
- next-step from `assembly.dependencies` + evidence + jurisdiction pack

Do not start it before the Ryan Trades Test.

Out of scope until the engine is proven: accounts, payments, chatbots, photo/video upload, blueprint ingestion, permit submission, FEM, CFD, hydraulic sizing, voltage-drop, VR, jobsite reconstruction, as-built twin.
