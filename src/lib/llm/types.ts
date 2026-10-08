export type LlmProvider = {
  name: string; // used in the cache key, so switching provider/model re-runs the AI
  generate(prompt: string): Promise<string>; // returns the raw JSON text
};

// An error from the AI service, with the HTTP status so we can decide whether to retry.
export class LlmError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}
