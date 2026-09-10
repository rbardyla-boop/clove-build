#!/usr/bin/env node
/**
 * Authoritative repository gate.
 *
 * npm test        = complete test suite (platform + lib + Clove core)
 * npm run test:clove = Clove subset only — never report as the full count
 * npm run verify  = npm test + typecheck + production build
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RECEIPT = join(ROOT, "src/crates/test-receipts/last-run.json");

function run(label, command, args) {
  process.stdout.write(`\n==> ${label}\n`);
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    env: process.env,
  });
  if (result.error) {
    process.stderr.write(`${result.error.stack ?? result.error.message}\n`);
    return { label, ok: false, stdout: "", stderr: String(result.error) };
  }
  process.stdout.write(result.stdout ?? "");
  process.stderr.write(result.stderr ?? "");
  return {
    label,
    ok: result.status === 0,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function parseTapTotals(text) {
  const passed = [...text.matchAll(/^# pass (\d+)/gm)].reduce((s, m) => s + Number(m[1]), 0);
  const failed = [...text.matchAll(/^# fail (\d+)/gm)].reduce((s, m) => s + Number(m[1]), 0);
  return { passed, failed };
}

function readReceipt() {
  try {
    return JSON.parse(readFileSync(RECEIPT, "utf8"));
  } catch {
    return {};
  }
}

const tests = run("full repository tests", "npm", ["test"]);
const typecheck = run("typecheck", "npm", ["run", "typecheck"]);
const build = run("production build", "npm", ["run", "build"]);

const totals = parseTapTotals(tests.stdout);
const prev = readReceipt();
const cloveCore = prev.cloveCore ?? { passed: prev.passed ?? 0, failed: prev.failed ?? 0 };

const payload = {
  ...prev,
  cloveCore,
  fullRepository: totals,
  typecheck: typecheck.ok ? "PASS" : "FAIL",
  productionBuild: build.ok ? "PASS" : "FAIL",
  githubCi: prev.githubCi ?? "NOT YET RUN",
  ryanHumanTest: prev.ryanHumanTest ?? "NOT YET RUN",
  browserVerification: prev.browserVerification === "VERIFIED" ? "VERIFIED" : "NOT VERIFIED",
  ranAt: new Date().toISOString(),
};

writeFileSync(RECEIPT, `${JSON.stringify(payload, null, 2)}\n`);

const ok = tests.ok && typecheck.ok && build.ok;
process.stdout.write(
  `\nverify: tests ${tests.ok ? "PASS" : "FAIL"} (${totals.passed} passed, ${totals.failed} failed) · clove ${cloveCore.passed}/${cloveCore.failed} · typecheck ${payload.typecheck} · build ${payload.productionBuild}\n`,
);
process.exit(ok ? 0 : 1);
