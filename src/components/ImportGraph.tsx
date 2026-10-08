"use client";
import { useMemo, useState } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import GraphDetails from "@/components/GraphDetails";
import GraphLegend from "@/components/GraphLegend";
import { selectCore } from "@/lib/selectCore";
import { toFlow } from "@/lib/toFlow";
import type { ImportGraph as ImportGraphData } from "@/lib/types";

// defined outside the component so React Flow doesn't see "new" objects every render
const NODE_TYPES = {};
const EDGE_TYPES = {};

type Props = {
  graph: ImportGraphData;
};

export default function ImportGraph({ graph }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const view = useMemo(() => (showAll ? graph : selectCore(graph)), [graph, showAll]);
  const flow = useMemo(() => toFlow(view, selected), [view, selected]);

  if (graph.nodes.length === 0) {
    return <p className="text-sm text-neutral-400">No imports between JS/TS files found in this repo.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => { setShowAll(false); setSelected(null); }}
          className={`rounded-lg border px-3 py-1 ${!showAll ? "border-white bg-white text-black" : "border-neutral-600"}`}
        >
          Core files ({Math.min(20, graph.nodes.length)})
        </button>
        <button
          onClick={() => { setShowAll(true); setSelected(null); }}
          className={`rounded-lg border px-3 py-1 ${showAll ? "border-white bg-white text-black" : "border-neutral-600"}`}
        >
          All files ({graph.nodes.length})
        </button>
      </div>

      <GraphLegend nodes={view.nodes} />

      <div className="h-[600px] rounded-lg border border-neutral-700">
        <ReactFlow
          key={showAll ? "all" : "core"}
          nodes={flow.nodes}
          edges={flow.edges}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          onNodeClick={(_, node) => setSelected(node.id === selected ? null : node.id)}
          onPaneClick={() => setSelected(null)}
          fitView
          minZoom={0.1}
          nodesConnectable={false}
          nodesDraggable={false}
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      <GraphDetails selected={selected} edges={view.edges} />
    </div>
  );
}
