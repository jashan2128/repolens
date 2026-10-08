import { LlmError, type LlmProvider } from "./types";
import { isBusy, withRetry } from "./withRetry";

function friendlyError(status: number, body: string, model: string): string {
  const detail = body.slice(0, 200);
  if (status === 400) return `Gemini rejected the request. Is GEMINI_API_KEY correct? (${detail})`;
  if (status === 403) return `Gemini denied access for this key/model. (${detail})`;
  if (status === 404) {
    return `Model "${model}" not found. Set GEMINI_MODEL in .env.local to a current model name from aistudio.google.com`;
  }
  if (status === 429) return "Free limit reached. Wait a minute (or until tomorrow) and try again.";
  if (status === 503) return "Gemini is overloaded right now (Google's side, not your code). Wait a minute and click Explain again.";
  return `Gemini error ${status}: ${detail}`;
}

async function callModel(apiKey: string, model: string, prompt: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
      }),
    });
  } catch {
    throw new LlmError("Could not reach Gemini. Check your internet connection.");
  }

  if (!res.ok) throw new LlmError(friendlyError(res.status, await res.text(), model), res.status);

  const data = await res.json();
  const parts: { text?: string }[] = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((p) => p.text ?? "").join("");
  if (!text) throw new LlmError("Gemini returned an empty answer. Try again.");
  return text;
}

// Busy? Retry once, then switch to the fallback model (a lighter model is usually less crowded).
export function createGemini(apiKey: string, model: string, fallbackModel?: string): LlmProvider {
  return {
    name: `gemini:${model}`,

    async generate(prompt: string): Promise<string> {
      try {
        return await withRetry(() => callModel(apiKey, model, prompt));
      } catch (err) {
        if (!fallbackModel || fallbackModel === model || !isBusy(err)) throw err;
        return withRetry(() => callModel(apiKey, fallbackModel, prompt));
      }
    },
  };
}
