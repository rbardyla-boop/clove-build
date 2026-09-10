import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

test("clove-test.mjs does not hard-code /workspace (PORTABILITY-001)", () => {
  const src = readFileSync(join(ROOT, "scripts/clove-test.mjs"), "utf8");
  assert.equal(src.includes("/workspace"), false);
  assert.match(src, /import\.meta\.url/);
  assert.match(src, /fileURLToPath/);
  assert.match(src, /result\.error/);
  assert.match(src, /result\.stdout \?\? ""/);
});

test("ts-alias-loader.mjs does not hard-code /workspace (PORTABILITY-001)", () => {
  const src = readFileSync(join(ROOT, "scripts/ts-alias-loader.mjs"), "utf8");
  assert.equal(src.includes("/workspace"), false);
  assert.match(src, /import\.meta\.url/);
});

test("register-alias.mjs resolves the loader from its own directory", () => {
  const src = readFileSync(join(ROOT, "scripts/register-alias.mjs"), "utf8");
  assert.equal(src.includes("/workspace"), false);
  assert.match(src, /import\.meta\.url/);
});
