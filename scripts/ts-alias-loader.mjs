import { existsSync, statSync } from "node:fs";
import { dirname, resolve as pathResolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = pathResolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = pathResolve(ROOT, "src");

function asFile(file) {
  try {
    return existsSync(file) && statSync(file).isFile();
  } catch {
    return false;
  }
}

function candidatesFor(base) {
  return [base, `${base}.ts`, `${base}.tsx`, `${base}.json`, pathResolve(base, "index.ts")];
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    for (const file of candidatesFor(pathResolve(SRC, specifier.slice(2)))) {
      if (asFile(file)) return { url: pathToFileURL(file).href, shortCircuit: true };
    }
  } else if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    const dir = dirname(fileURLToPath(context.parentURL));
    for (const file of candidatesFor(pathResolve(dir, specifier))) {
      if (asFile(file)) return { url: pathToFileURL(file).href, shortCircuit: true };
    }
  }
  return nextResolve(specifier, context);
}
