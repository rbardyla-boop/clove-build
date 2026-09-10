import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Local reference adapter.
 *
 * A person who lawfully possesses NBC/NPC/CEC PDFs may keep them in
 * `private-reference/` (gitignored) or CLOVE_CODE_REFERENCE_DIR.
 *
 * The public engine never reads those files. Fair dealing is not a
 * product dependency. Listing filenames is not redistribution of text.
 */
export type LocalCodeReference = {
  present: boolean;
  dir: string;
  files: string[];
  usedByEngine: false;
  note: string;
};

export const LOCAL_REFERENCE_DIRNAME = "private-reference";

export function localReferenceDir(root = process.cwd()): string {
  return process.env.CLOVE_CODE_REFERENCE_DIR || join(root, LOCAL_REFERENCE_DIRNAME);
}

export function inspectLocalCodeReference(root = process.cwd()): LocalCodeReference {
  const dir = localReferenceDir(root);
  const note =
    "Lawful personal copies may live here. Clove does not read, parse, quote, or ship them. The engine uses original predicates and citation pointers only.";
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    return { present: false, dir, files: [], usedByEngine: false, note };
  }
  const files = readdirSync(dir).filter((name) => {
    if (name.startsWith(".")) return false;
    if (name.toLowerCase() === "readme.md") return false;
    return true;
  });
  return { present: files.length > 0, dir, files, usedByEngine: false, note };
}
