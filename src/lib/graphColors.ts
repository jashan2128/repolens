// A file's "area" = its folder, up to 2 levels deep.
// "source/core/Ky.ts" -> "source/core", "src/lib/a/b.ts" -> "src/lib", "index.ts" -> "(root)"
export function areaOf(filePath: string): string {
  const folders = filePath.split("/").slice(0, -1);
  return folders.length ? folders.slice(0, 2).join("/") : "(root)";
}

// Same folder name -> same color, every time.
export function colorFor(area: string): string {
  let hash = 5381;
  for (const ch of area) hash = (Math.imul(hash, 33) + ch.charCodeAt(0)) >>> 0;
  return `hsl(${hash % 360}, 65%, 55%)`;
}
