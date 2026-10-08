import type { LlmProvider } from "./types";

// No API, no limits. Use it to test the UI: set LLM_PROVIDER=mock in .env.local
export const mockProvider: LlmProvider = {
  name: "mock",
  async generate(): Promise<string> {
    return JSON.stringify({
      summary: "This is a fake explanation from the mock provider, used only for testing the UI.",
      structure: "Real explanations appear here once LLM_PROVIDER is set back to gemini.",
      startHere: [{ file: "README.md", why: "Mock pick: most repos start with the README." }],
      concepts: ["Mock concept A", "Mock concept B"],
    });
  },
};
