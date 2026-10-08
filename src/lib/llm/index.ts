import { createGemini } from "./gemini";
import { mockProvider } from "./mock";
import type { LlmProvider } from "./types";

// To add Groq / Ollama later: create a file like gemini.ts and add a case here.
export function getProvider(): LlmProvider {
  const which = process.env.LLM_PROVIDER ?? "gemini";

  if (which === "mock") return mockProvider;

  if (which === "gemini") {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is missing. Add it to .env.local and restart the server.");
    }
    return createGemini(
      key,
      process.env.GEMINI_MODEL ?? "gemini-flash-latest",
      process.env.GEMINI_FALLBACK_MODEL ?? "gemini-flash-lite-latest"
    );
  }

  throw new Error(`Unknown LLM_PROVIDER "${which}". Use "gemini" or "mock".`);
}
