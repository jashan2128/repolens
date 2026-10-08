import { LlmError } from "./types";

// "Server busy / temporary problem" statuses. Worth trying again.
const BUSY = new Set([500, 502, 503, 504]);

export function isBusy(err: unknown): boolean {
  return err instanceof LlmError && err.status !== undefined && BUSY.has(err.status);
}

// Tries again (after 2s, 4s, ...) only when the service is busy. Other errors fail right away.
export async function withRetry<T>(fn: () => Promise<T>, attempts = 2, baseMs = 2000): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (err) {
      if (!isBusy(err) || i >= attempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, baseMs * i));
    }
  }
}
