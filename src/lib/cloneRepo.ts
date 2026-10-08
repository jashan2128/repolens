import { simpleGit } from "simple-git";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

export async function removeRepo(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true });
}

// Shallow clone (latest commit only) into a temp folder. Returns folder path.
export async function cloneRepo(cloneUrl: string): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "repolens-"));
  const git = simpleGit({ timeout: { block: 60_000 } });

  try {
    await git.clone(cloneUrl, dir, ["--depth", "1"]);
    return dir;
  } catch (err) {
    await removeRepo(dir);
    throw err;
  }
}