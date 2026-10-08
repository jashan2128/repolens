"use client";
import RepoForm from "@/components/RepoForm";
import FileTree from "@/components/FileTree";
import ImportGraph from "@/components/ImportGraph";
import ExplainPanel from "@/components/ExplainPanel";
import { useAnalyze } from "@/hooks/useAnalyze";
import { useExplain } from "@/hooks/useExplain";

export default function Home() {
  const { tree, graph, facts, loading, error, analyze } = useAnalyze();
  const ai = useExplain();

  function handleSubmit(url: string) {
    ai.reset(); // clear the old explanation when a new repo is analyzed
    analyze(url);
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-8">
      <h1 className="text-2xl font-semibold">RepoLens</h1>
      <RepoForm onSubmit={handleSubmit} loading={loading} />

      {error && <p className="text-sm text-red-400">{error}</p>}

      {facts && (
        <ExplainPanel
          facts={facts}
          explanation={ai.explanation}
          loading={ai.loading}
          error={ai.error}
          onExplain={() => ai.explain(facts)}
        />
      )}

      {graph && (
        <section className="space-y-2">
          <h2 className="text-lg font-medium">
            Import graph{" "}
            <span className="text-sm text-neutral-400">
              ({graph.nodes.length} connected files of {graph.totalSourceFiles} source files)
            </span>
          </h2>
          <ImportGraph graph={graph} />
        </section>
      )}

      {tree && (
        <section className="space-y-2">
          <h2 className="text-lg font-medium">File tree</h2>
          <ul>
            <FileTree node={tree} />
          </ul>
        </section>
      )}
    </main>
  );
}
