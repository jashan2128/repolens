import { readFile } from "fs/promises";
import path from "path";
import { isNoise } from "./isNoise";
import { listFiles } from "./listFiles";
import type { FileNode, ImportGraph, RepoFacts } from "./types";

const README_CHARS = 3000;

async function readText(dir: string, rel: string, maxChars: number): Promise<string> {
  try {
    return (await readFile(path.join(dir, rel), "utf8")).slice(0, maxChars);
  } catch {
    return "";
  }
}

function findReadme(tree: FileNode): string | null {
  const hit = tree.children?.find((n) => n.type === "file" && /^readme(\.\w+)?$/i.test(n.name));
  return hit ? hit.path : null;
}

async function readPackageJson(dir: string) {
  try {
    const pkg = JSON.parse(await readText(dir, "package.json", 50_000));
    return {
      description: typeof pkg.description === "string" ? pkg.description : "",
      dependencies: Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).slice(0, 40),
      scripts: Object.keys(pkg.scripts ?? {}).slice(0, 10),
    };
  } catch {
    return { description: "", dependencies: [], scripts: [] };
  }
}

function countLanguages(files: string[]) {
  const counts = new Map<string, number>();
  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    if (ext) counts.set(ext, (counts.get(ext) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([ext, files]) => ({ ext, files }));
}

// shallow files first, so README / config / main folders show up in the sample
function sampleFiles(files: string[]): string[] {
  return [...files]
    .sort((a, b) => a.split("/").length - b.split("/").length || a.localeCompare(b))
    .slice(0, 40);
}

function pickEntryFiles(graph: ImportGraph): string[] {
  return graph.nodes
    .filter((n) => n.importedBy === 0 && n.imports > 0 && !isNoise(n.id))
    .sort((a, b) => b.imports - a.imports)
    .slice(0, 5)
    .map((n) => n.id);
}

function pickMostImported(graph: ImportGraph) {
  return [...graph.nodes]
    .filter((n) => n.importedBy > 0 && !isNoise(n.id)) // skip test helpers
    .sort((a, b) => b.importedBy - a.importedBy)
    .slice(0, 8)
    .map((n) => ({ file: n.id, importedBy: n.importedBy }));
}

export async function collectFacts(
  dir: string,
  owner: string,
  repo: string,
  tree: FileNode,
  graph: ImportGraph
): Promise<RepoFacts> {
  const files = listFiles(tree);
  const readmePath = findReadme(tree);
  const pkg = await readPackageJson(dir);

  return {
    owner,
    repo,
    readme: readmePath ? await readText(dir, readmePath, README_CHARS) : "",
    ...pkg,
    topFolders: (tree.children ?? []).filter((n) => n.type === "dir").map((n) => n.name).slice(0, 20),
    languages: countLanguages(files),
    sampleFiles: sampleFiles(files),
    mostImported: pickMostImported(graph),
    entryFiles: pickEntryFiles(graph),
    totalFiles: files.length,
  };
}
