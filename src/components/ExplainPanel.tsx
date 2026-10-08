import type { Explanation, RepoFacts } from "@/lib/types";

type Props = {
  facts: RepoFacts;
  explanation: Explanation | null;
  loading: boolean;
  error: string;
  onExplain: () => void;
};

export default function ExplainPanel({ facts, explanation, loading, error, onExplain }: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-medium">Explanation</h2>
        {!explanation && (
          <button
            onClick={onExplain}
            disabled={loading}
            className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-black disabled:opacity-40"
          >
            {loading ? "Thinking..." : "✨ Explain this repo"}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {explanation && (
        <div className="space-y-4 rounded-lg border border-neutral-700 p-4 text-sm leading-relaxed">
          <Block title="What it is">{explanation.summary}</Block>
          <Block title="How it is organised">{explanation.structure}</Block>

          {explanation.startHere.length > 0 && (
            <div>
              <h3 className="mb-1 font-medium text-neutral-300">Start reading here</h3>
              <ol className="list-decimal space-y-1 pl-5">
                {explanation.startHere.map((s) => (
                  <li key={s.file}>
                    <code className="text-amber-400">{s.file}</code>: {s.why}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {explanation.concepts.length > 0 && (
            <div>
              <h3 className="mb-1 font-medium text-neutral-300">Know these first</h3>
              <div className="flex flex-wrap gap-2">
                {explanation.concepts.map((c) => (
                  <span key={c} className="rounded-full border border-neutral-600 px-2.5 py-0.5">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-neutral-500">
            Based on {facts.totalFiles} files in {facts.owner}/{facts.repo}. AI can make mistakes.
          </p>
        </div>
      )}
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 font-medium text-neutral-300">{title}</h3>
      <p>{children}</p>
    </div>
  );
}
