import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const svg = readFileSync("/workspace/public/favicon.svg", "utf8");
const browser = await chromium.launch();
for (const s of [16, 32, 64]) {
  const page = await browser.newPage({ viewport: { width: s, height: s } });
  await page.setContent(
    `<!doctype html><html><head><style>
      html,body{margin:0;width:${s}px;height:${s}px;overflow:hidden;background:transparent}
      svg{display:block;width:${s}px;height:${s}px}
    </style></head><body>${svg}</body></html>`,
    { waitUntil: "load" },
  );
  await page.screenshot({
    path: `/workspace/.grok/favicon-${s}.png`,
    omitBackground: false,
  });
  await page.close();
  console.log("wrote", s);
}
await browser.close();
