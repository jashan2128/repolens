import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

const DIR = path.join(tmpdir(), "repolens-cache");

export function cacheKey(...parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path.join(DIR, `${key}.json`), "utf8")) as T;
  } catch {
    return null; // no cache yet
  }
}

export async function writeCache(key: string, value: unknown): Promise<void> {
  try {
    await mkdir(DIR, { recursive: true });
    await writeFile(path.join(DIR, `${key}.json`), JSON.stringify(value));
  } catch {
    // cache is optional, never fail the request because of it
  }
}
