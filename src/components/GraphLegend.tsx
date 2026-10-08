import { areaOf, colorFor } from "@/lib/graphColors";
import type { GraphNode } from "@/lib/types";

type Props = {
  nodes: GraphNode[];
};

export default function GraphLegend({ nodes }: Props) {
  const areas = [...new Set(nodes.map((n) => areaOf(n.id)))].sort();

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-300">
      {areas.map((area) => (
        <span key={area} className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: colorFor(area) }} />
          {area}
        </span>
      ))}
    </div>
  );
}
