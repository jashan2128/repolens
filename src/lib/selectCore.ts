import { isNoise } from "./isNoise";
import type { ImportGraph } from "./types";

// The "core" view: only the most connected source files (tests/benchmarks left out),
// and only the arrows between them. Small enough to actually read.
export function selectCore(graph: ImportGraph, limit = 20): ImportGraph {
  const nodes = [...graph.nodes]
    .filter((n) => !isNoise(n.id))
    .sort((a, b) => b.importedBy + b.imports - (a.importedBy + a.imports))
    .slice(0, limit);

  const keep = new Set(nodes.map((n) => n.id));
  const edges = graph.edges.filter((e) => keep.has(e.from) && keep.has(e.to));

  return { nodes, edges, totalSourceFiles: graph.totalSourceFiles };
}
