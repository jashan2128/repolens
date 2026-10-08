import { MarkerType, type Edge, type Node } from "reactflow";
import { areaOf, colorFor } from "./graphColors";
import { layoutGraph } from "./layoutGraph";
import type { ImportGraph } from "./types";

export function toFlow(graph: ImportGraph, selected: string | null): { nodes: Node[]; edges: Edge[] } {
  const positions = layoutGraph(graph);

  // files directly connected to the clicked one
  const related = new Set<string>();
  if (selected) {
    related.add(selected);
    for (const e of graph.edges) {
      if (e.from === selected) related.add(e.to);
      if (e.to === selected) related.add(e.from);
    }
  }

  const nodes: Node[] = graph.nodes.map((n) => {
    const name = n.id.split("/").pop() ?? n.id;
    const folder = n.id.slice(0, n.id.length - name.length - 1);
    const faded = selected !== null && !related.has(n.id);

    return {
      id: n.id,
      position: positions.get(n.id) ?? { x: 0, y: 0 },
      sourcePosition: "right" as never,
      targetPosition: "left" as never,
      data: {
        label: (
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>{folder || "(root)"}</div>
          </div>
        ),
      },
      style: {
        width: 230,
        color: "#111",
        background: "#fff",
        borderLeft: `6px solid ${colorFor(areaOf(n.id))}`,
        border: n.id === selected ? "2px solid #f59e0b" : "1px solid #999",
        borderLeftWidth: 6,
        opacity: faded ? 0.2 : 1,
      },
    };
  });

  const edges: Edge[] = graph.edges.map((e) => {
    const active = selected !== null && (e.from === selected || e.to === selected);
    const faded = selected !== null && !active;
    return {
      id: `${e.from}->${e.to}`,
      source: e.from,
      target: e.to,
      markerEnd: { type: MarkerType.ArrowClosed },
      animated: active,
      style: { stroke: active ? "#f59e0b" : "#777", strokeWidth: active ? 2 : 1, opacity: faded ? 0.08 : 0.8 },
    };
  });

  return { nodes, edges };
}
