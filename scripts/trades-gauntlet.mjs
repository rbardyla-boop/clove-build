#!/usr/bin/env node
/**
 * Browser gauntlet for Clove v0.2 — exercises TRACE, trades, explode, check, reset.
 * Requires a running preview on 8080.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const URL = process.env.CLOVE_URL || "http://127.0.0.1:8080/";
const OUT = "/workspace/screenshots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ["--use-gl=angle", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on("pageerror", (err) => errors.push(String(err)));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});

await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForSelector("canvas.lab-canvas", { timeout: 30000 });
await page.waitForFunction(() => Boolean(window.__clove?.getState?.()?.componentCount), { timeout: 30000 });
await page.waitForTimeout(1200);

async function clove() {
  return page.evaluate(() => window.__clove.getState());
}
async function dispatch(cmd) {
  await page.evaluate((c) => window.__clove.dispatch(c), cmd);
}

const shots = [];
async function shot(name) {
  const path = `${OUT}/v02-${name}.png`;
  await page.screenshot({ path, fullPage: false });
  shots.push(path);
}

const fail = [];
function check(id, ok, note) {
  if (!ok) fail.push(`${id}: ${note}`);
  return { id, ok, note };
}

const results = [];

// A — orbit finished house (camera exists, house loaded)
{
  const s = await clove();
  results.push(check("A", s.graphId === "PEI-PART9-DEMO-001" && s.componentCount > 200, `components=${s.componentCount}`));
  await shot("a-orbit");
}

// B — scrub foundation → finished
{
  await dispatch({ type: "SET_CONSTRUCTION_STAGE", stage: 4 });
  await page.waitForTimeout(200);
  let s = await clove();
  results.push(check("B1", s.constructionStage === 4, `stage=${s.constructionStage}`));
  await shot("b-foundation");
  await dispatch({ type: "SET_CONSTRUCTION_STAGE", stage: 23 });
  await page.waitForTimeout(200);
  s = await clove();
  results.push(check("B2", s.constructionStage === 23, `stage=${s.constructionStage}`));
}

// C — toggle trade layers
{
  await dispatch({ type: "SET_TRADE_LAYER", trade: "finish", state: "off" });
  await dispatch({ type: "SET_TRADE_LAYER", trade: "plumbing", state: "on" });
  await page.waitForTimeout(150);
  const s = await clove();
  results.push(check("C", s.tradeLayers.finish === "off" && s.tradeLayers.plumbing === "on", JSON.stringify(s.tradeLayers)));
  await shot("c-layers");
  await dispatch({ type: "SET_TRADE_LAYER", trade: "finish", state: "on" });
}

// D — whole explode
{
  await dispatch({ type: "SET_EXPLODE_SCOPE", scope: "whole" });
  await dispatch({ type: "SET_EXPLODE", amount: 1 });
  await page.waitForTimeout(250);
  let s = await clove();
  results.push(check("D", s.explodeAmount === 1 && s.explodeScope === "whole", `amt=${s.explodeAmount}`));
  await shot("d-explode");
  await dispatch({ type: "SET_EXPLODE", amount: 0 });
}

// E — exterior wall explode
{
  await dispatch({ type: "SELECT_COMPONENT", id: "assembly.wall.front.stud.00" });
  await dispatch({ type: "SET_EXPLODE_SCOPE", scope: "assembly.wall.front" });
  await dispatch({ type: "SET_EXPLODE", amount: 1 });
  await page.waitForTimeout(250);
  const s = await clove();
  results.push(check("E", s.explodeScope === "assembly.wall.front", `scope=${s.explodeScope}`));
  await shot("e-front-wall");
  await dispatch({ type: "SET_EXPLODE", amount: 0 });
}

// F — bathroom wall explode
{
  await dispatch({ type: "SELECT_COMPONENT", id: "assembly.wall.bath.stud.00" });
  await dispatch({ type: "SET_EXPLODE_SCOPE", scope: "assembly.wall.bath" });
  await dispatch({ type: "SET_EXPLODE", amount: 1 });
  await page.waitForTimeout(250);
  const s = await clove();
  results.push(check("F", s.explodeScope === "assembly.wall.bath", `scope=${s.explodeScope}`));
  await shot("f-bath-wall");
}

// G — plumbing trace
{
  await dispatch({ type: "SELECT_COMPONENT", id: "plumbing.fixture.sink.bath" });
  await dispatch({ type: "TRACE_FROM", id: "plumbing.fixture.sink.bath" });
  await page.waitForTimeout(200);
  const s = await clove();
  results.push(
    check(
      "G",
      s.trace?.trade === "plumbing" && s.trace.componentIds.includes("plumbing.dwv.building-drain.001"),
      `ids=${s.trace?.componentIds?.length}`,
    ),
  );
  await shot("g-plumb-trace");
}

// H — electrical trace
{
  await dispatch({ type: "TRACE_FROM", id: "electrical.device.receptacle.front.001" });
  await page.waitForTimeout(200);
  const s = await clove();
  results.push(
    check(
      "H",
      s.trace?.trade === "electrical" && s.trace.componentIds.includes("electrical.panel.main"),
      `ids=${s.trace?.componentIds?.length}`,
    ),
  );
  await shot("h-elec-trace");
}

// I — HVAC trace
{
  await dispatch({ type: "TRACE_FROM", id: "hvac.exhaust.bath.001" });
  await page.waitForTimeout(200);
  const s = await clove();
  results.push(
    check(
      "I",
      s.trace?.trade === "hvac" && s.trace.componentIds.includes("hvac.exhaust.bath.outlet"),
      `ids=${s.trace?.componentIds?.length}`,
    ),
  );
  await shot("i-hvac-trace");
}

// J — hide finish / x-ray
{
  await dispatch({ type: "SET_EXPLODE", amount: 0 });
  await dispatch({ type: "SET_HIDE_FINISH", enabled: true });
  await dispatch({ type: "SET_XRAY", enabled: true });
  await page.waitForTimeout(200);
  const s = await clove();
  results.push(check("J", s.hideFinish === true && s.xray === true, `hide=${s.hideFinish} xray=${s.xray}`));
  await shot("j-hide-finish");
}

// K — break structure
{
  await dispatch({ type: "SET_HIDE_FINISH", enabled: false });
  await dispatch({ type: "SET_XRAY", enabled: false });
  await dispatch({ type: "SET_MODE", mode: "break-it" });
  await dispatch({ type: "REMOVE_COMPONENT", id: "assembly.wall.front.jack.W1.L" });
  await page.waitForTimeout(150);
  const s = await clove();
  results.push(check("K", s.removedIds.includes("assembly.wall.front.jack.W1.L"), `removed=${s.removedIds.join(",")}`));
}

// L — break plumbing
{
  await dispatch({ type: "REMOVE_COMPONENT", id: "plumbing.dwv.trap.lav.001" });
  const s = await clove();
  results.push(check("L", s.removedIds.includes("plumbing.dwv.trap.lav.001"), `removed=${s.removedIds.join(",")}`));
}

// M — break electrical
{
  await dispatch({ type: "REMOVE_COMPONENT", id: "electrical.cable.receptacles.001" });
  const s = await clove();
  results.push(check("M", s.removedIds.includes("electrical.cable.receptacles.001"), `removed=${s.removedIds.join(",")}`));
}

// N — whole-house CHECK
{
  await dispatch({ type: "RUN_CHECK" });
  await page.waitForTimeout(300);
  const s = await clove();
  const fails = (s.check ?? []).filter((r) => r.verdict === "FAIL");
  const missing = (s.check ?? []).filter((r) => r.verdict === "MISSING_INFORMATION" || r.verdict === "UNCERTAIN");
  const officialPass = (s.check ?? []).filter(
    (r) => r.verdict === "PASS" && ["NBC-SNOW-001", "PLUMB-NPC-TEXT-001", "ELEC-CEC-TEXT-001", "PEI-ENERGY-PATH-001"].includes(r.ruleId),
  );
  results.push(
    check(
      "N",
      fails.length > 0 && missing.length > 0 && officialPass.length === 0 && (s.check ?? []).length > 8,
      `fail=${fails.length} incomplete=${missing.length} rules=${s.check?.length}`,
    ),
  );
  await shot("n-check");
}

// O — RESET
{
  await dispatch({ type: "RESET_SPECIMEN" });
  await page.waitForTimeout(250);
  const s = await clove();
  results.push(
    check(
      "O",
      s.removedIds.length === 0 &&
        s.explodeAmount === 0 &&
        s.trace === null &&
        s.hideFinish === false &&
        s.constructionStage === 23 &&
        s.flowMode === "off",
      JSON.stringify({ removed: s.removedIds, explode: s.explodeAmount, stage: s.constructionStage, flow: s.flowMode }),
    ),
  );
}

// P — explode after reset
{
  await dispatch({ type: "SET_EXPLODE_SCOPE", scope: "whole" });
  await dispatch({ type: "SET_EXPLODE", amount: 1 });
  await page.waitForTimeout(250);
  let s = await clove();
  results.push(check("P1", s.explodeAmount === 1, `amt=${s.explodeAmount}`));
  await shot("p-explode-after-reset");
  await dispatch({ type: "SET_EXPLODE", amount: 0 });
  s = await clove();
  results.push(check("P2", s.explodeAmount === 0, `amt=${s.explodeAmount}`));
}

const severe = errors.filter((e) => !/ResizeObserver|favicon|Failed to load/i.test(e));
results.push(check("console", severe.length === 0, severe.slice(0, 5).join(" | ") || "clean"));

const webgl = await page.evaluate(() => {
  const c = document.querySelector("canvas.lab-canvas");
  if (!c) return false;
  const gl = c.getContext("webgl2") || c.getContext("webgl");
  return Boolean(gl);
});
results.push(check("webgl", webgl, webgl ? "ok" : "no context"));

await shot("z-final");
await browser.close();

const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok).length;
const report = { passed, failed, results, shots, errors: severe };
writeFileSync(`${OUT}/v02-gauntlet.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(failed === 0 ? 0 : 1);
