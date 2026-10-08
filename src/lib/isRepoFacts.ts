import type { RepoFacts } from "./types";

const MAX_BYTES = 40_000;
const STRING_FIELDS = ["owner", "repo", "readme", "description"];
const ARRAY_FIELDS = [
  "dependencies", "scripts", "topFolders", "languages",
  "sampleFiles", "mostImported", "entryFiles",
];

// Returns null if facts are fine, otherwise a message saying exactly what is wrong.
export function factsProblem(v: unknown): string | null {
  if (!v || typeof v !== "object") return "facts is missing (is analyze/route.ts the new version?)";
  const f = v as Record<string, unknown>;

  for (const k of STRING_FIELDS) {
    if (typeof f[k] !== "string") return `facts.${k} should be a string`;
  }
  for (const k of ARRAY_FIELDS) {
    if (!Array.isArray(f[k])) return `facts.${k} should be a list`;
  }
  if (typeof f.totalFiles !== "number") return "facts.totalFiles should be a number";
  if (JSON.stringify(v).length > MAX_BYTES) return "facts is too big";
  return null;
}

export function isRepoFacts(v: unknown): v is RepoFacts {
  return factsProblem(v) === null;
}
