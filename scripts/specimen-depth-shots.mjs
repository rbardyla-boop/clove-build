#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const URL = process.env.CLOVE_URL || "http://127.0.0.1:8080/";
const OUT = "/workspace/screenshots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ["--use-gl=angle", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForSelector("canvas.lab-canvas", { timeout: 30000 });
await page.waitForFunction(() => Boolean(window.__clove?.getState?.()?.componentCount), { timeout: 30000 });

async function dispatch(cmd) {
  await page.evaluate((c) => window.__clove.dispatch(c), cmd);
}
async function wait(ms = 400) {
  await page.waitForTimeout(ms);
}
async function shot(name) {
  const path = `${OUT}/v03-${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log(path);
}
async function load(id) {
  await dispatch({ type: "RESET_SPECIMEN" });
  await dispatch({ type: "LOAD_SPECIMEN", id });
  await page.waitForFunction((want) => window.__clove.getState().graphId === want, id, { timeout: 20000 });
  await dispatch({ type: "SET_CONSTRUCTION_STAGE", stage: 23 });
  await dispatch({ type: "SET_EXPLODE", amount: 0 });
  await dispatch({ type: "SET_HIDE_FINISH", enabled: false });
  await dispatch({ type: "SET_XRAY", enabled: false });
  await dispatch({ type: "SET_FLOW_MODE", mode: "off" });
  for (const trade of ["foundation", "structure", "envelope", "plumbing", "electrical", "hvac", "thermal", "finish"]) {
    await dispatch({ type: "SET_TRADE_LAYER", trade, state: "on" });
  }
  await dispatch({ type: "FIT_HOUSE" });
  await wait(700);
}

await load("PEI-SLAB-COTTAGE-001");
await shot("01-slab-finished");

await dispatch({ type: "SET_HIDE_FINISH", enabled: true });
await dispatch({ type: "FIT_HOUSE" });
await wait(500);
await shot("02-slab-hide-finish");

await dispatch({ type: "SET_HIDE_FINISH", enabled: false });
await dispatch({ type: "SET_TRADE_LAYER", trade: "finish", state: "off" });
await dispatch({ type: "SET_TRADE_LAYER", trade: "envelope", state: "ghost" });
await dispatch({ type: "SELECT_COMPONENT", id: "slab.grade" });
await dispatch({ type: "SET_EXPLODE_SCOPE", scope: "assembly.foundation" });
await dispatch({ type: "SET_EXPLODE", amount: 1 });
await dispatch({ type: "FIT_SELECTED" });
await wait(600);
await shot("03-slab-foundation-exploded");

await dispatch({ type: "SET_EXPLODE", amount: 0 });
await dispatch({ type: "SET_TRADE_LAYER", trade: "finish", state: "off" });
await dispatch({ type: "SET_TRADE_LAYER", trade: "envelope", state: "ghost" });
await dispatch({ type: "SET_TRADE_LAYER", trade: "structure", state: "ghost" });
await dispatch({ type: "SET_TRADE_LAYER", trade: "plumbing", state: "on" });
await dispatch({ type: "SET_TRADE_LAYER", trade: "electrical", state: "on" });
await dispatch({ type: "SET_TRADE_LAYER", trade: "hvac", state: "on" });
await dispatch({ type: "SET_FLOW_MODE", mode: "dwv" });
await dispatch({ type: "SELECT_COMPONENT", id: "plumbing.dwv.stack.001" });
await dispatch({ type: "FIT_HOUSE" });
await wait(600);
await shot("04-slab-services");

await dispatch({ type: "SET_FLOW_MODE", mode: "off" });
await dispatch({ type: "SET_TRADE_LAYER", trade: "envelope", state: "ghost" });
await dispatch({ type: "SET_TRADE_LAYER", trade: "finish", state: "off" });
await dispatch({ type: "SELECT_COMPONENT", id: "roof.ridge" });
await dispatch({ type: "SET_EXPLODE_SCOPE", scope: "assembly.roof" });
await dispatch({ type: "SET_EXPLODE", amount: 1 });
await dispatch({ type: "FIT_SELECTED" });
await wait(600);
await shot("05-slab-roof-exploded");

await load("PEI-RURAL-POOL-001");
await shot("06-rural-finished");

await dispatch({ type: "SET_HIDE_FINISH", enabled: true });
await dispatch({ type: "FIT_HOUSE" });
await wait(500);
await shot("07-rural-hide-finish");

await dispatch({ type: "SET_HIDE_FINISH", enabled: false });
await dispatch({ type: "SET_TRADE_LAYER", trade: "finish", state: "ghost" });
await dispatch({ type: "SET_TRADE_LAYER", trade: "plumbing", state: "on" });
await dispatch({ type: "SET_TRADE_LAYER", trade: "electrical", state: "on" });
await dispatch({ type: "SELECT_COMPONENT", id: "pool.001" });
await dispatch({ type: "FIT_HOUSE" });
await wait(600);
await shot("08-rural-house-pool");

await dispatch({ type: "SELECT_COMPONENT", id: "equipment.pad.001" });
await dispatch({ type: "SET_FLOW_MODE", mode: "supply" });
await dispatch({ type: "FIT_SELECTED" });
await wait(600);
await shot("09-pool-equipment");

await dispatch({ type: "SET_FLOW_MODE", mode: "energize" });
await dispatch({ type: "SELECT_COMPONENT", id: "equipment.pad.001" });
await dispatch({ type: "FIT_SELECTED" });
await wait(600);
await shot("10-pool-electrical");

await dispatch({ type: "SET_FLOW_MODE", mode: "off" });
await dispatch({ type: "SET_XRAY", enabled: true });
await dispatch({ type: "SELECT_COMPONENT", id: "electrical.cable.pool.feed" });
await dispatch({ type: "FIT_HOUSE" });
await wait(600);
await shot("11-buried-services");

await dispatch({ type: "SET_XRAY", enabled: false });
await dispatch({ type: "SET_EXPLODE_SCOPE", scope: "whole" });
await dispatch({ type: "SET_EXPLODE", amount: 0.85 });
await dispatch({ type: "FIT_HOUSE" });
await wait(800);
await shot("12-rural-exploded");

await browser.close();
