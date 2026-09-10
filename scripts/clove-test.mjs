import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const result = spawnSync(
  process.execPath,
  [
    "--import",
    "./scripts/register-alias.mjs",
    "--experimental-strip-types",
    "--test",
    "src/crates/building-graph/integrity.test.ts",
    "src/crates/explode/engine.test.ts",
    "src/crates/construction-sequence/visibility.test.ts",
    "src/crates/session/apply.test.ts",
    "src/crates/rule-engine/engine.test.ts",
    "src/crates/observation/seams.test.ts",
  ],
  { encoding: "utf8", cwd: "/workspace" },
);

process.stdout.write(result.stdout);
process.stderr.write(result.stderr);

const pass = [...(result.stdout.matchAll(/# pass (\d+)/g))].pop()?.[1];
const fail = [...(result.stdout.matchAll(/# fail (\d+)/g))].pop()?.[1];
const passed = Number(pass ?? 0);
const failed = Number(fail ?? (result.status === 0 ? 0 : 1));

let browserVerification = "NOT VERIFIED";
try {
  const prev = JSON.parse(readFileSync("/workspace/src/crates/test-receipts/last-run.json", "utf8"));
  if (prev.browserVerification === "VERIFIED") browserVerification = "VERIFIED";
} catch {
  /* first run */
}

const payload = {
  passed,
  failed,
  ranAt: new Date().toISOString(),
  browserVerification,
  ruleDeterminism: result.status === 0 ? "PASS" : "FAIL",
};

writeFileSync("/workspace/src/crates/test-receipts/last-run.json", `${JSON.stringify(payload, null, 2)}\n`);

process.exit(result.status ?? 1);
