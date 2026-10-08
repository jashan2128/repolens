import type { Explanation, RepoFacts } from "./types";

const text = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

export function parseExplanation(raw: string, facts: RepoFacts): Explanation {
  let json: Record<string, unknown>;
  try {
    // some models wrap JSON in ```json fences even when told not to
    json = JSON.parse(raw.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/, "").trim());
  } catch {
    throw new Error("The AI answer was not valid JSON. Click Explain again.");
  }

  // the AI may only point at files we actually gave it (blocks made-up paths)
  const known = new Set([
    ...facts.sampleFiles,
    ...facts.entryFiles,
    ...facts.mostImported.map((m) => m.file),
  ]);

  const startHere = (Array.isArray(json.startHere) ? json.startHere : [])
    .map((item) => ({ file: text(item?.file), why: text(item?.why) }))
    .filter((item) => known.has(item.file))
    .slice(0, 5);

  const concepts = (Array.isArray(json.concepts) ? json.concepts : [])
    .map(text)
    .filter(Boolean)
    .slice(0, 8);

  const explanation = { summary: text(json.summary), structure: text(json.structure), startHere, concepts };
  if (!explanation.summary) throw new Error("The AI answer was missing a summary. Click Explain again.");
  return explanation;
}
