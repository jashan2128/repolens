import { NextResponse } from "next/server";
import { parseGithubUrl } from "@/lib/parseGithubUrl";
import { cloneRepo, removeRepo } from "@/lib/cloneRepo";
import { buildFileTree } from "@/lib/buildFileTree";
import { findSourceFiles } from "@/lib/findSourceFiles";
import { buildGraph } from "@/lib/buildGraph";
import { collectFacts } from "@/lib/collectFacts";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url : "";

  const ref = parseGithubUrl(url);
  if (!ref) {
    return NextResponse.json({ error: "Enter a valid GitHub repo URL" }, { status: 400 });
  }

  let dir: string | null = null;
  try {
    dir = await cloneRepo(ref.cloneUrl);
    const tree = await buildFileTree(dir, ref.repo);
    const graph = await buildGraph(dir, findSourceFiles(tree));
    const facts = await collectFacts(dir, ref.owner, ref.repo, tree, graph);
    return NextResponse.json({ owner: ref.owner, repo: ref.repo, tree, graph, facts });
  } catch (err) {
    console.error("[analyze] failed:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (dir) await removeRepo(dir);
  }
}