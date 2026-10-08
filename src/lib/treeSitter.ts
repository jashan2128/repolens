import Parser from "web-tree-sitter";
import path from "path";

type LangName = "javascript" | "typescript" | "tsx";

const NODE_MODULES = path.join(process.cwd(), "node_modules");
const languages = new Map<LangName, Parser.Language>();
let parserPromise: Promise<Parser> | null = null;

// Creates the parser once and reuses it for every file.
export function getParser(): Promise<Parser> {
  if (!parserPromise) {
    parserPromise = Parser.init({
      locateFile: (name: string) => path.join(NODE_MODULES, "web-tree-sitter", name),
    })
      .then(() => new Parser())
      .catch((err) => {
        parserPromise = null; // allow retry after a failure
        throw err;
      });
  }
  return parserPromise;
}

export function langForFile(file: string): LangName {
  if (file.endsWith(".tsx")) return "tsx";
  if (file.endsWith(".ts")) return "typescript";
  return "javascript"; // .js .jsx .mjs .cjs (this grammar handles JSX too)
}

export async function loadLanguage(name: LangName): Promise<Parser.Language> {
  const cached = languages.get(name);
  if (cached) return cached;

  const wasm = path.join(NODE_MODULES, "tree-sitter-wasms", "out", `tree-sitter-${name}.wasm`);
  const lang = await Parser.Language.load(wasm);
  languages.set(name, lang);
  return lang;
}
