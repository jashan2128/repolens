import type { ImportGraph } from "./types";

const COL_WIDTH = 300;
const ROW_HEIGHT = 74;

// Left -> right: files nobody imports (in this view) on the left,
// the files they depend on further right.
export function layoutGraph(graph: ImportGraph): Map<string, { x: number; y: number }> {
  const layer = new Map<string, number>();

  const children = new Map<string, string[]>();
  const hasParent = new Set<string>();
  for (const e of graph.edges) {
    children.set(e.from, [...(children.get(e.from) ?? []), e.to]);
    hasParent.add(e.to);
  }

  function bfs(start: string) {
    layer.set(start, 0);
    const queue = [start];
    while (queue.length) {
      const current = queue.shift()!;
      for (const next of children.get(current) ?? []) {
        if (!layer.has(next)) {
          layer.set(next, layer.get(current)! + 1);
          queue.push(next);
        }
      }
    }
  }

  // roots first, then anything left over (files stuck in import cycles)
  graph.nodes.filter((n) => !hasParent.has(n.id)).forEach((n) => bfs(n.id));
  graph.nodes.forEach((n) => {
    if (!layer.has(n.id)) bfs(n.id);
  });

  const rowInLayer = new Map<number, number>();
  const positions = new Map<string, { x: number; y: number }>();

  for (const node of graph.nodes) {
    const col = layer.get(node.id) ?? 0;
    const row = rowInLayer.get(col) ?? 0;
    rowInLayer.set(col, row + 1);
    positions.set(node.id, { x: col * COL_WIDTH, y: row * ROW_HEIGHT });
  }
  return positions;
}
