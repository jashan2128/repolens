"use client";
import { useState } from "react";
import type { FileNode, ImportGraph, RepoFacts } from "@/lib/types";

export function useAnalyze() {
  const [tree, setTree] = useState<FileNode | null>(null);
  const [graph, setGraph] = useState<ImportGraph | null>(null);
  const [facts, setFacts] = useState<RepoFacts | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze(url: string) {
    setLoading(true);
    setError("");
    setTree(null);
    setGraph(null);
    setFacts(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setTree(data.tree);
      setGraph(data.graph);
      setFacts(data.facts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return { tree, graph, facts, loading, error, analyze };
}
