import { siteFacts } from "@/crates/site/facts";
import type { BuildingGraph } from "@/crates/building-graph/types";
import { findClashes, type ClashFinding, type ClashKind } from "@/crates/clash/engine";
import { classifyComponent, serviceRunTooLongInOccupied } from "@/crates/space-model/classify";
import { zoneAllowsExposedService } from "@/crates/space-model/zones";
import { classifyDwvRun } from "@/crates/geometry/run";
import { routeSegments } from "./segments";

export type RoutingKind =
  | "OCCUPIED_SPACE"
  | "SOLID_HOST_COLLISION"
  | "MISSING_PENETRATION"
  | "DISCONNECTED_ROUTE"
  | "FLOATING_COMPONENT"
  | "IMPOSSIBLE_TRANSITION"
  | "ROUTE_OUTSIDE_ALLOWED_ZONE"
  | "REVERSE_GRADE";

export type RoutingFinding = {
  id: string;
  kind: RoutingKind;
  a: string;
  b: string;
  reason: string;
  zone?: string;
};

const SERVICE_TYPES = new Set([
  "pipe-supply",
  "pipe-dwv",
  "pipe-vent",
  "cable",
  "duct",
  "refrigerant-line",
  "condensate",
]);

function mapClash(c: ClashFinding): RoutingFinding {
  const kind: RoutingKind =
    c.kind === "GEOMETRIC_CLASH"
      ? "SOLID_HOST_COLLISION"
      : c.kind === "DISCONNECTED_SYSTEM"
        ? "DISCONNECTED_ROUTE"
        : (c.kind as RoutingKind);
  return { id: c.id, kind, a: c.a, b: c.b, reason: c.reason };
}

/**
 * Geometric/system routing facts. Not regulatory determinations.
 */
export function findRoutingIssues(graph: BuildingGraph, removedIds: readonly string[] = []): RoutingFinding[] {
  const removed = new Set(removedIds);
  const clashes = findClashes(graph, removedIds);
  const findings: RoutingFinding[] = clashes.map(mapClash);

  const segs = routeSegments(graph, removedIds);
  for (const seg of segs) {
    if (seg.hostSpace === "OCCUPIED_ROOM") {
      const c = graph.components[seg.id];
      if (!c) continue;
      if (zoneAllowsExposedService(seg.hostSpace)) continue;
      if (seg.exposedAllowed) continue;
      if (!serviceRunTooLongInOccupied(c)) continue;
      if (findings.some((f) => f.kind === "OCCUPIED_SPACE" && f.a === seg.id)) continue;
      findings.push({
        id: `route.occupied.${seg.id}`,
        kind: "OCCUPIED_SPACE",
        a: seg.id,
        b: "living-volume",
        reason: `${c.label} occupies ${seg.hostSpace} instead of a cavity, chase, attic, or mechanical space.`,
        zone: seg.hostSpace,
      });
    }
    if (seg.hostSpace === "EXTERIOR") {
      const c = graph.components[seg.id];
      if (!c) continue;
      const tags = c.tags ?? [];
      const outdoorOk =
        c.type === "refrigerant-line" ||
        tags.includes("service") ||
        tags.includes("exhaust") ||
        c.type === "service-entry";
      if (!outdoorOk && serviceRunTooLongInOccupied(c)) {
        findings.push({
          id: `route.outside.${seg.id}`,
          kind: "ROUTE_OUTSIDE_ALLOWED_ZONE",
          a: seg.id,
          b: "exterior",
          reason: `${c.label} leaves the building envelope without a modelled service-entry or outdoor-equipment role.`,
          zone: seg.hostSpace,
        });
      }
    }
  }

  for (const c of Object.values(graph.components)) {
    if (removed.has(c.id) || !SERVICE_TYPES.has(c.type)) continue;
    if (!c.system?.nodeId) {
      findings.push({
        id: `route.float.${c.id}`,
        kind: "FLOATING_COMPONENT",
        a: c.id,
        b: c.trade ?? "unknown",
        reason: `${c.label} is a service member with no system node — it is not on a traceable route.`,
      });
    }
    const zone = classifyComponent(graph, c);
    if (c.type === "duct" && zone === "FLOOR_CAVITY") {
      const [sx, sy, sz] = c.geometry.size;
      const vertical = sy >= Math.max(sx, sz) * 1.4;
      if (!vertical && (sy > siteFacts(graph).joistDepth * 0.33 || Math.min(sx, sz) > siteFacts(graph).joistDepth * 0.33)) {
        findings.push({
          id: `route.joist.${c.id}`,
          kind: "IMPOSSIBLE_TRANSITION",
          a: c.id,
          b: "floor-joist",
          reason: `${c.label} is too large for the 2×10 joist cavity. A trunk this size is hung below the joists, not bored through them.`,
          zone,
        });
      }
    }
    if ((c.type === "pipe-dwv" || c.type === "pipe-vent") && zone === "FLOOR_CAVITY") {
      const alongX = c.geometry.size[0];
      const dia = Math.min(c.geometry.size[1], c.geometry.size[2]);
      if (alongX > 1.0 && dia > 0.03 && c.geometry.center[1] > siteFacts(graph).sillTop) {
        findings.push({
          id: `route.joistbore.${c.id}`,
          kind: "IMPOSSIBLE_TRANSITION",
          a: c.id,
          b: "floor-joist",
          reason: `${c.label} crosses multiple joist bays inside the joist depth. Hang the run below the joists or stay in one bay.`,
          zone,
        });
      }
    }
    if (c.type === "pipe-dwv") {
      const grade = classifyDwvRun(c);
      if (grade.kind === "reverse-grade") {
        findings.push({
          id: `route.reverse.${c.id}`,
          kind: "REVERSE_GRADE",
          a: c.id,
          b: "flow-direction",
          reason: `${c.label} rises in its declared flow direction (start ${grade.startElevation?.toFixed(3)} m → end ${grade.endElevation?.toFixed(3)} m). That is reverse grade, not a sloped drain.`,
        });
      }
    }
  }

  const bySystem = new Map<string, typeof segs>();
  for (const s of segs) {
    const arr = bySystem.get(s.systemId) ?? [];
    arr.push(s);
    bySystem.set(s.systemId, arr);
  }
  for (const sys of graph.systems) {
    const nodeById = new Map(sys.nodes.map((n) => [n.id, n]));
    for (const conn of sys.connections) {
      const a = nodeById.get(conn.from);
      const b = nodeById.get(conn.to);
      if (!a || !b) continue;
      if (removed.has(a.componentId) || removed.has(b.componentId)) continue;
      const ca = graph.components[a.componentId];
      const cb = graph.components[b.componentId];
      if (!ca || !cb) continue;
      if (!SERVICE_TYPES.has(ca.type) || !SERVICE_TYPES.has(cb.type)) continue;
      const za = classifyComponent(graph, ca);
      const zb = classifyComponent(graph, cb);
      const jump =
        (za === "UNDER_FLOOR" || za === "FLOOR_CAVITY" || za === "MECHANICAL_SPACE") && zb === "OCCUPIED_ROOM";
      const jump2 =
        (zb === "UNDER_FLOOR" || zb === "FLOOR_CAVITY" || zb === "MECHANICAL_SPACE") && za === "OCCUPIED_ROOM";
      if (!(jump || jump2)) continue;
      const long = serviceRunTooLongInOccupied(jump ? cb : ca);
      if (!long) continue;
      const rising = jump ? cb : ca;
      const hasPen = Object.values(graph.components).some(
        (p) => p.type === "penetration" && p.penetration?.tradeComponentId === rising.id,
      );
      if (hasPen) continue;
      findings.push({
        id: `route.transition.${conn.id}`,
        kind: "IMPOSSIBLE_TRANSITION",
        a: ca.id,
        b: cb.id,
        reason: `Route ${conn.id} jumps from ${za} to ${zb} without a modelled floor/wall penetration.`,
      });
    }
  }

  return findings;
}

export function routingKindsFromClash(kind: ClashKind): RoutingKind {
  if (kind === "GEOMETRIC_CLASH") return "SOLID_HOST_COLLISION";
  if (kind === "DISCONNECTED_SYSTEM") return "DISCONNECTED_ROUTE";
  return kind as RoutingKind;
}
