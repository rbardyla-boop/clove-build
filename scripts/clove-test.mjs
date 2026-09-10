import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Repository root derived from this file, not a sandbox path (PORTABILITY-001). */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RECEIPT = join(ROOT, "src/crates/test-receipts/last-run.json");
const REGISTER = join(ROOT, "scripts/register-alias.mjs");

const TEST_FILES = [
  "src/crates/building-graph/integrity.test.ts",
  "src/crates/explode/engine.test.ts",
  "src/crates/construction-sequence/visibility.test.ts",
  "src/crates/session/apply.test.ts",
  "src/crates/rule-engine/engine.test.ts",
  "src/crates/observation/seams.test.ts",
];

const result = spawnSync(
  process.execPath,
  ["--import", REGISTER, "--experimental-strip-types", "--test", ...TEST_FILES],
  { encoding: "utf8", cwd: ROOT },
);

if (result.error) {
  process.stderr.write(`${result.error.stack ?? result.error.message}\n`);
  process.exit(1);
}

process.stdout.write(result.stdout ?? "");
process.stderr.write(result.stderr ?? "");

if (result.status == null && result.signal) {
  process.stderr.write(`clove tests killed by ${result.signal}\n`);
  process.exit(1);
}

const out = result.stdout ?? "";
const pass = [...out.matchAll(/# pass (\d+)/g)].pop()?.[1];
const fail = [...out.matchAll(/# fail (\d+)/g)].pop()?.[1];
const passed = Number(pass ?? 0);
const failed = Number(fail ?? (result.status === 0 ? 0 : 1));
const childOk = result.status === 0;

let prev = {};
try {
  prev = JSON.parse(readFileSync(RECEIPT, "utf8"));
} catch {
  /* first run */
}

const payload = {
  ...prev,
  passed,
  failed,
  cloveCore: { passed, failed },
  ranAt: new Date().toISOString(),
  browserVerification: prev.browserVerification === "VERIFIED" ? "VERIFIED" : "NOT VERIFIED",
  ruleDeterminism: childOk ? "PASS" : "FAIL",
  githubCi: prev.githubCi ?? "NOT YET RUN",
  ryanHumanTest: prev.ryanHumanTest ?? "NOT YET RUN",
  typecheck: prev.typecheck ?? "NOT YET RUN",
  productionBuild: prev.productionBuild ?? "NOT YET RUN",
  fullRepository: prev.fullRepository ?? { passed: 0, failed: 0 },
};

writeFileSync(RECEIPT, `${JSON.stringify(payload, null, 2)}\n`);

process.exit(result.status ?? 1);
