import type { BuildingComponent, BuildingGraph, TradeId, Vec3 } from "@/crates/building-graph/types";
import { classifyComponent } from "@/crates/space-model/classify";
import type { SpaceZoneId } from "@/crates/space-model/zones";

const SERVICE_TYPES = new Set([
  "pipe-supply",
  "pipe-dwv",
  "pipe-vent",
  "cable",
  "duct",
  "refrigerant-line",
  "condensate",
]);

export type RouteSegment = {
  id: string;
  systemId: string;
  trade: TradeId;
  from: Vec3;
  to: Vec3;
  hostSpace: SpaceZoneId;
  hostComponentId?: string;
  exposedAllowed: boolean;
  intendedPenetrationIds: string[];
};

function endsOf(c: BuildingComponent): { from: Vec3; to: Vec3 } {
  const [x, y, z] = c.geometry.center;
  const [sx, sy, sz] = c.geometry.size;
  if (sx >= sy && sx >= sz) return { from: [x - sx / 2, y, z], to: [x + sx / 2, y, z] };
  if (sy >= sx && sy >= sz) return { from: [x, y - sy / 2, z], to: [x, y + sy / 2, z] };
  return { from: [x, y, z - sz / 2], to: [x, y, z + sz / 2] };
}

export function routeSegments(graph: BuildingGraph, removedIds: readonly string[] = []): RouteSegment[] {
  const removed = new Set(removedIds);
  const pens = Object.values(graph.components).filter((c) => c.type === "penetration" && c.penetration);
  const out: RouteSegment[] = [];
  for (const c of Object.values(graph.components)) {
    if (removed.has(c.id) || c.geometry.kind !== "box") continue;
    if (!SERVICE_TYPES.has(c.type)) continue;
    const { from, to } = endsOf(c);
    const hostSpace = classifyComponent(graph, c);
    const intended = pens
      .filter((p) => p.penetration?.tradeComponentId === c.id)
      .map((p) => p.id);
    const trade = (c.trade ?? "plumbing") as TradeId;
    out.push({
      id: c.id,
      systemId: c.system?.systemId ?? `system.${trade}`,
      trade,
      from,
      to,
      hostSpace,
      hostComponentId: c.parentId,
      exposedAllowed: hostSpace === "MECHANICAL_SPACE" || hostSpace === "EXTERIOR" || hostSpace === "SERVICE_ENTRY",
      intendedPenetrationIds: intended,
    });
  }
  return out;
}
