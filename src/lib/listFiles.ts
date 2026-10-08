import type { FileNode } from "./types";

// Flattens the file tree into every file path (always "/" separated).
export function listFiles(tree: FileNode): string[] {
  const files: string[] = [];

  function walk(node: FileNode) {
    if (node.type === "file") {
      files.push(node.path.replace(/\\/g, "/"));
      return;
    }
    node.children?.forEach(walk);
  }

  walk(tree);
  return files;
}
