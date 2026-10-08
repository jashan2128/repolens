export type LlmProvider = {
  name: string; // used in the cache key, so switching provider/model re-runs the AI
  generate(prompt: string): Promise<string>; // returns the raw JSON text
};
