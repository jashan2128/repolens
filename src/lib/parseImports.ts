import type Parser from "web-tree-sitter";
import { getParser, langForFile, loadLanguage } from "./treeSitter";

// "./utils" (with quotes) -> ./utils
function unquote(text: string): string {
  return text.slice(1, -1);
}

// Returns every module path a file imports/re-exports/requires.
// Handles: import x from "a" | import "a" | export * from "a" | require("a") | import("a")
export async function parseImports(file: string, source: string): Promise<string[]> {
  const parser = await getParser();
  parser.setLanguage(await loadLanguage(langForFile(file)));

  const tree = parser.parse(source);
  const found: string[] = [];

  const nodes = tree.rootNode.descendantsOfType([
    "import_statement",
    "export_statement",
    "call_expression",
  ]);

  for (const node of nodes) {
    const spec = readSpecifier(node);
    if (spec) found.push(spec);
  }

  tree.delete(); // free WASM memory
  return found;
}

function readSpecifier(node: Parser.SyntaxNode): string | null {
  if (node.type === "call_expression") {
    const fn = node.childForFieldName("function");
    const args = node.childForFieldName("arguments");
    const isLoader = fn && (fn.text === "require" || fn.type === "import");
    const first = args?.namedChild(0);
    return isLoader && first?.type === "string" ? unquote(first.text) : null;
  }

  // import_statement / export_statement: only "from" ones have a source
  const source = node.childForFieldName("source");
  return source ? unquote(source.text) : null;
}
