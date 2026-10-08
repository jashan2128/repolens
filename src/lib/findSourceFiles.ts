import type { FileNode } from "./types";

const SOURCE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const MAX_FILES = 400; // keep analysis fast on huge repos

// Flattens the file tree into a list of source file paths (always "/" separated).
export function findSourceFiles(tree: FileNode): string[] {
  const files: string[] = [];

  function walk(node: FileNode) {
    if (files.length >= MAX_FILES) return;

    if (node.type === "file") {
      if (SOURCE_EXT.test(node.name) && !node.name.endsWith(".d.ts")) {
        files.push(node.path.replace(/\\/g, "/")); // Windows -> "/"
      }
      return;
    }
    node.children?.forEach(walk);
  }

  walk(tree);
  return files;
}
