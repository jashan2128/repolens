"use client";
import { useState } from "react";
import type { Explanation, RepoFacts } from "@/lib/types";

export function useExplain() {
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function explain(facts: RepoFacts) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facts }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setExplanation(data.explanation);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setExplanation(null);
    setError("");
  }

  return { explanation, loading, error, explain, reset };
}
