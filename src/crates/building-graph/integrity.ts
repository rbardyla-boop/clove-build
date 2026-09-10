import type { BuildingGraph, BuildingComponent } from "./types";

export type IntegrityIssue = {
  code: string;
  message: string;
  componentId?: string;
};

export function checkGraphIntegrity(graph: BuildingGraph): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  const { components } = graph;

  for (const root of graph.rootIds) {
    if (!components[root]) issues.push({ code: "missing-root", message: `Root ${root} missing` });
  }
  for (const a of graph.assemblies) {
    if (!components[a]) issues.push({ code: "missing-assembly", message: `Assembly ${a} missing` });
  }

  for (const [id, c] of Object.entries(components)) {
    if (c.id !== id) {
      issues.push({ code: "id-mismatch", message: `Key ${id} != component.id ${c.id}`, componentId: id });
    }
    if (c.parentId) {
      const p = components[c.parentId];
      if (!p) {
        issues.push({ code: "missing-parent", message: `${id} parent ${c.parentId} missing`, componentId: id });
      } else if (!p.childIds.includes(id)) {
        issues.push({
          code: "parent-child",
          message: `${id} not listed on parent ${c.parentId}`,
          componentId: id,
        });
      }
    }
    for (const childId of c.childIds) {
      const child = components[childId];
      if (!child) {
        issues.push({ code: "missing-child", message: `${id} child ${childId} missing`, componentId: id });
      } else if (child.parentId !== id) {
        issues.push({
          code: "child-parent",
          message: `${childId} parentId is ${child.parentId}, expected ${id}`,
          componentId: childId,
        });
      }
    }
    for (const dep of c.assembly.dependencies) {
      if (!components[dep]) {
        issues.push({
          code: "missing-dependency",
          message: `${id} depends on missing ${dep}`,
          componentId: id,
        });
      }
    }
    checkRefs(c, "supportedBy", issues, components);
    checkRefs(c, "supports", issues, components);
  }

  return issues;
}

function checkRefs(
  c: BuildingComponent,
  field: "supportedBy" | "supports",
  issues: IntegrityIssue[],
  components: Record<string, BuildingComponent>,
) {
  const refs = c.structural?.[field];
  if (!refs) return;
  for (const ref of refs) {
    if (!components[ref]) {
      issues.push({
        code: "missing-structural-ref",
        message: `${c.id}.${field} → missing ${ref}`,
        componentId: c.id,
      });
    }
  }
}

export function isGraphSound(graph: BuildingGraph): boolean {
  return checkGraphIntegrity(graph).length === 0;
}

export function descendants(graph: BuildingGraph, id: string): string[] {
  const out: string[] = [];
  const stack = [...(graph.components[id]?.childIds ?? [])];
  while (stack.length) {
    const next = stack.pop()!;
    out.push(next);
    const kids = graph.components[next]?.childIds;
    if (kids) stack.push(...kids);
  }
  return out;
}

export function belongsToAssembly(graph: BuildingGraph, componentId: string, assemblyId: string): boolean {
  if (componentId === assemblyId) return true;
  let cur: string | undefined = componentId;
  const guard = new Set<string>();
  while (cur) {
    if (cur === assemblyId) return true;
    if (guard.has(cur)) break;
    guard.add(cur);
    const c: BuildingComponent | undefined = graph.components[cur];
    if (!c) break;
    if (c.assembly.explodeGroup === assemblyId) return true;
    cur = c.parentId;
  }
  return false;
}
