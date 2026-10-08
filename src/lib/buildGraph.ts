import { readFile, stat } from "fs/promises";
import path from "path";
import { parseImports } from "./parseImports";
import { resolveImport } from "./resolveImport";
import type { GraphEdge, GraphNode, ImportGraph } from "./types";

const MAX_FILE_BYTES = 500_000; // skip huge/minified files

export async function buildGraph(root: string, files: string[]): Promise<ImportGraph> {
  const fileSet = new Set(files);
  const edgeKeys = new Set<string>();
  const edges: GraphEdge[] = [];

  for (const file of files) {
    const full = path.join(root, file);

    try {
      if ((await stat(full)).size > MAX_FILE_BYTES) continue;
      const source = await readFile(full, "utf8");

      for (const spec of await parseImports(file, source)) {
        const target = resolveImport(file, spec, fileSet);
        if (!target || target === file) continue;

        const key = `${file}->${target}`;
        if (edgeKeys.has(key)) continue;
        edgeKeys.add(key);
        edges.push({ from: file, to: target });
      }
    } catch (err) {
      console.warn(`[graph] skipped ${file}:`, err); // one bad file shouldn't kill the run
    }
  }

  return { nodes: makeNodes(edges), edges, totalSourceFiles: files.length };
}

// Only files that actually connect to something (isolated files = clutter)
function makeNodes(edges: GraphEdge[]): GraphNode[] {
  const map = new Map<string, GraphNode>();
  const get = (id: string) => {
    if (!map.has(id)) map.set(id, { id, imports: 0, importedBy: 0 });
    return map.get(id)!;
  };

  for (const e of edges) {
    get(e.from).imports++;
    get(e.to).importedBy++;
  }
  return [...map.values()];
}
