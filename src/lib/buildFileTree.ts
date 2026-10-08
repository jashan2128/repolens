import { readdir } from "fs/promises";
import path from "path";
import type { FileNode } from "./types";

const IGNORED = new Set([
  ".git", "node_modules", ".next", "dist", "build",
  "__pycache__", ".venv", "venv", ".idea", ".vscode",
]);
const MAX_FILES = 3000; // safety cap for huge repos

// folders first, then A-Z
function sortNodes(nodes: FileNode[]): FileNode[] {
  return nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export async function buildFileTree(root: string, rootName: string): Promise<FileNode> {
  let fileCount = 0;

  async function walk(dir: string): Promise<FileNode[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const nodes: FileNode[] = [];

    for (const entry of entries) {
      if (IGNORED.has(entry.name)) continue;
      if (fileCount >= MAX_FILES) break;

      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full);

      if (entry.isDirectory()) {
        nodes.push({ name: entry.name, path: rel, type: "dir", children: await walk(full) });
      } else if (entry.isFile()) {
        fileCount++;
        nodes.push({ name: entry.name, path: rel, type: "file" });
      }
      // symlinks are skipped on purpose (safety)
    }

    return sortNodes(nodes);
  }

  return { name: rootName, path: "", type: "dir", children: await walk(root) };
}
