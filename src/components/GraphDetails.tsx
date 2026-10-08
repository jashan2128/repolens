import type { GraphEdge } from "@/lib/types";

type Props = {
  selected: string | null;
  edges: GraphEdge[];
};

// Shows, in words, what the clicked file imports and who imports it.
export default function GraphDetails({ selected, edges }: Props) {
  if (!selected) {
    return (
      <p className="text-sm text-neutral-400">
        Arrows point from a file to the files it imports. Click any file to see its connections.
      </p>
    );
  }

  const imports = edges.filter((e) => e.from === selected).map((e) => e.to);
  const importedBy = edges.filter((e) => e.to === selected).map((e) => e.from);

  return (
    <div className="space-y-1 text-sm">
      <p>
        <code className="text-amber-400">{selected}</code>
      </p>
      <p className="text-neutral-300">
        Imports {imports.length} file(s){imports.length ? `: ${imports.join(", ")}` : ""}
      </p>
      <p className="text-neutral-300">
        Used by {importedBy.length} file(s){importedBy.length ? `: ${importedBy.join(", ")}` : ""}
      </p>
    </div>
  );
}
