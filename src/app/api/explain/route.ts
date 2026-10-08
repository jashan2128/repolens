import { NextResponse } from "next/server";
import { explainRepo } from "@/lib/explainRepo";
import { factsProblem, isRepoFacts } from "@/lib/isRepoFacts";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const facts = body?.facts;

  if (!isRepoFacts(facts)) {
    return NextResponse.json({ error: `Invalid repo facts: ${factsProblem(facts)}` }, { status: 400 });
  }

  try {
    const explanation = await explainRepo(facts);
    return NextResponse.json({ explanation });
  } catch (err) {
    console.error("[explain] failed:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
