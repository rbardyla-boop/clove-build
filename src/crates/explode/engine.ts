import { belongsToAssembly } from "@/crates/building-graph/integrity";
import type { BuildingComponent, BuildingGraph, TradeId, Vec3 } from "@/crates/building-graph/types";
import { tradeOf } from "@/crates/trades/infer";

export type ExplodeScope = "whole" | `trade:${TradeId}` | string;

export function clampAmount(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.max(0, Math.min(1, amount));
}

export function scaleVec(v: Vec3, s: number): Vec3 {
  return [v[0] * s, v[1] * s, v[2] * s];
}

export function addVec(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function vecLen(v: Vec3): number {
  return Math.hypot(v[0], v[1], v[2]);
}

/**
 * Exploded visual offset. Canonical geometry is never mutated.
 * amount 0 is always the identity. Repeated 0↔1 cycles cannot drift
 * because this is a pure function of (component, amount, scope).
 *
 * Whole-house explode uses explodeVector only so v0.1 structure tests stay valid.
 * Trade explode uses tradeExplodeVector (or localExplodeVector as fallback).
 */
export function explodeOffset(
  graph: BuildingGraph,
  component: BuildingComponent,
  amount: number,
  scope: ExplodeScope,
): Vec3 {
  const a = clampAmount(amount);
  if (a === 0) return [0, 0, 0];
  if (component.geometry.kind === "group") return [0, 0, 0];
  if (scope === "whole") return scaleVec(component.assembly.explodeVector, a);
  if (typeof scope === "string" && scope.startsWith("trade:")) {
    const want = scope.slice(6) as TradeId;
    if (tradeOf(component) !== want) return [0, 0, 0];
    return scaleVec(component.assembly.tradeExplodeVector ?? component.assembly.localExplodeVector, a);
  }
  if (!belongsToAssembly(graph, component.id, scope)) return [0, 0, 0];
  return scaleVec(component.assembly.localExplodeVector, a);
}

export function explodedCenter(
  graph: BuildingGraph,
  component: BuildingComponent,
  amount: number,
  scope: ExplodeScope,
): Vec3 {
  return addVec(component.geometry.center, explodeOffset(graph, component, amount, scope));
}
