import { buildPrompt, PROMPT_VERSION } from "./buildPrompt";
import { cacheKey, readCache, writeCache } from "./cache";
import { getProvider } from "./llm";
import { parseExplanation } from "./parseExplanation";
import type { Explanation, RepoFacts } from "./types";

// Same repo facts + same provider + same prompt = answer from cache (no API call used).
export async function explainRepo(facts: RepoFacts): Promise<Explanation> {
  const provider = getProvider();
  const key = cacheKey(String(PROMPT_VERSION), provider.name, JSON.stringify(facts));

  const cached = await readCache<Explanation>(key);
  if (cached) return cached;

  const raw = await provider.generate(buildPrompt(facts));
  const explanation = parseExplanation(raw, facts);

  await writeCache(key, explanation);
  return explanation;
}
