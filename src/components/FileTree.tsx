import type { FileNode } from "@/lib/types";

type Props = {
  node: FileNode;
  depth?: number;
};

export default function FileTree({ node, depth = 0 }: Props) {
  if (node.type === "file") {
    return <li className="py-0.5 font-mono text-sm">📄 {node.name}</li>;
  }

  return (
    <li>
      <details open={depth === 0}>
        <summary className="cursor-pointer py-0.5 font-mono text-sm">
          📁 {node.name}
        </summary>
        <ul className="ml-4 border-l border-neutral-700 pl-3">
          {node.children?.map((child) => (
            <FileTree key={child.path} node={child} depth={depth + 1} />
          ))}
        </ul>
      </details>
    </li>
  );
}
