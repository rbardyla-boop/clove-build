import type { BuildingComponent } from "@/crates/building-graph/types";

export type Draft = Omit<BuildingComponent, "childIds"> & { childIds?: string[] };

export type Registry = {
  components: Record<string, BuildingComponent>;
  add: (c: Draft) => BuildingComponent;
};

export function createRegistry(): Registry {
  const components: Record<string, BuildingComponent> = {};
  function add(c: Draft): BuildingComponent {
    const comp: BuildingComponent = {
      ...c,
      childIds: [...(c.childIds ?? [])],
      selectable: c.selectable ?? c.geometry.kind !== "group",
    };
    if (components[comp.id]) {
      throw new Error(`Duplicate component id ${comp.id}`);
    }
    components[comp.id] = comp;
    if (comp.parentId) {
      const p = components[comp.parentId];
      if (!p) throw new Error(`Parent ${comp.parentId} missing for ${comp.id}`);
      if (!p.childIds.includes(comp.id)) p.childIds.push(comp.id);
    }
    return comp;
  }
  return { components, add };
}
