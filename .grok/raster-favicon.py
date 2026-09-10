from playwright.sync_api import sync_playwright
from pathlib import Path

svg = Path("/workspace/public/favicon.svg").read_text()
# file:// is simpler: serve the svg in a sized viewport
html = """<!doctype html>
<html><head><style>
html,body{margin:0;background:#888}
img{display:block}
</style></head><body>
<img id="icon" width="SIZE" height="SIZE" src="/favicon.svg">
</body></html>
"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    for s in (16, 32, 64, 180):
        page = browser.new_page(viewport={"width": s, "height": s})
        page.route("**/favicon.svg", lambda route: route.fulfill(
            path="/workspace/public/favicon.svg",
            content_type="image/svg+xml",
        ))
        page.set_content(html.replace("SIZE", str(s)), wait_until="load")
        page.wait_for_timeout(150)
        page.screenshot(path=f"/workspace/.grok/favicon-{s}.png", omit_background=False)
        print("wrote", s)
        page.close()
    browser.close()
print("done")
