# Roadmap

Not a promise. v0.1 must earn expansion.

- Human Ryan Test receipt before any new trade
- Additional verified PEI/NBC facts only with source rows and no copied code text
- Real IFC import behind `PlanIngestAdapter` → `BuildingGraphCandidate` → integrity, then `BuildingExchangeAdapter` round-trip
- CODE WATCH as a human-gated pack publisher, never an auto-rewriter
- Other provinces as additional jurisdiction packs, not conditionals in the UI
- Plumbing / electrical / HVAC only as new semantic trades with their own rules

After the first house passes the Ryan Test, the next product is not “AI looks at photos.” It is:

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

Do not start it before the Ryan Test.

Out of scope until the engine is proven: accounts, payments, chatbots, permit submission, FEM collapse animation, VR, jobsite reconstruction, as-built twin.
