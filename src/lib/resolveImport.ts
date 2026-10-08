import path from "path";

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

// Where could this import point? (before checking the extension)
function candidateBases(fromFile: string, spec: string): string[] {
  if (spec.startsWith(".")) {
    return [path.posix.join(path.posix.dirname(fromFile), spec)];
  }
  if (spec.startsWith("@/") || spec.startsWith("~/")) {
    const rest = spec.slice(2);
    return [`src/${rest}`, rest]; // common alias setups
  }
  return []; // npm package like "react" -> not part of the repo
}

function matchFile(base: string, allFiles: Set<string>): string | null {
  if (allFiles.has(base)) return base;

  // TS projects often write "./a.js" for a file that is really a.ts
  const stripped = base.replace(/\.(js|jsx|mjs|cjs)$/, "");

  for (const b of new Set([base, stripped])) {
    for (const ext of EXTENSIONS) {
      if (allFiles.has(b + ext)) return b + ext;
    }
    for (const ext of EXTENSIONS) {
      if (allFiles.has(`${b}/index${ext}`)) return `${b}/index${ext}`;
    }
  }
  return null;
}

// Returns the repo file this import points to, or null (external package / not found).
export function resolveImport(
  fromFile: string,
  spec: string,
  allFiles: Set<string>
): string | null {
  for (const base of candidateBases(fromFile, spec)) {
    const hit = matchFile(base, allFiles);
    if (hit) return hit;
  }
  return null;
}
