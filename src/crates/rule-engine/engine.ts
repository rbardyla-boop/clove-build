import type { BuildingGraph } from "@/crates/building-graph/types";
import { demoRules } from "@/rule-packs/demo/rules";
import type { Rule, RuleContext, RuleEvaluation, RuleLookup, RuleVerdict } from "./types";

export function makeLookup(graph: BuildingGraph, removedIds: readonly string[]): RuleLookup {
  const removed = new Set(removedIds);
  const byType = new Map<string, string[]>();
  const byTag = new Map<string, string[]>();
  for (const c of Object.values(graph.components)) {
    const t = byType.get(c.type) ?? [];
    t.push(c.id);
    byType.set(c.type, t);
    for (const tag of c.tags ?? []) {
      const arr = byTag.get(tag) ?? [];
      arr.push(c.id);
      byTag.set(tag, arr);
    }
  }
  return {
    has: (id) => Boolean(graph.components[id]),
    isRemoved: (id) => removed.has(id),
    typeOf: (id) => graph.components[id]?.type,
    idsByType: (type) => byType.get(type) ?? [],
    idsByTag: (tag) => byTag.get(tag) ?? [],
    supportedBy: (id) => graph.components[id]?.structural?.supportedBy ?? [],
    required: (id) => Boolean(graph.components[id]?.structural?.required),
    label: (id) => graph.components[id]?.label ?? id,
  };
}

export function evaluateRules(
  graph: BuildingGraph,
  ctx: Omit<RuleContext, "graphId" | "graphVersion">,
  rules: Rule[] = demoRules,
): RuleEvaluation[] {
  const full: RuleContext = {
    ...ctx,
    graphId: graph.id,
    graphVersion: graph.version,
  };
  const lookup = makeLookup(graph, ctx.removedIds);
  return rules.map((rule) => {
    const result = rule.evaluate(full, lookup);
    return {
      ruleId: rule.id,
      title: rule.title,
      verdict: result.verdict,
      componentIds: result.componentIds,
      inputs: result.inputs,
      reason: result.reason,
      assumption: result.assumption,
      sourceRefs: result.sourceRefs ?? rule.provenance.sourceIds,
      jurisdiction: ctx.jurisdictionId,
      rulePackVersion: rule.packVersion,
      evaluatedAt: ctx.now,
      provenance: rule.provenance,
      authorityLabel: rule.authorityLabel,
    };
  });
}

export function summarize(results: RuleEvaluation[]): Record<RuleVerdict, number> {
  const counts: Record<RuleVerdict, number> = {
    PASS: 0,
    FAIL: 0,
    MISSING_INFORMATION: 0,
    UNCERTAIN: 0,
  };
  for (const r of results) counts[r.verdict] += 1;
  return counts;
}

export function highlightedIds(results: RuleEvaluation[]): string[] {
  const ids = new Set<string>();
  for (const r of results) {
    if (r.verdict === "FAIL" || r.verdict === "UNCERTAIN") {
      for (const id of r.componentIds) ids.add(id);
    }
  }
  return [...ids];
}
