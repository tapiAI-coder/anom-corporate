/**
 * デバッグ用スクリーンショット: viewport 単体（fixed 背景確認）+ console ログ取得
 * 使い方: node scripts/screenshot-debug.cjs
 */
const puppeteer = require("puppeteer");
const path = require("path");

const url = "http://localhost:4321/anom-corporate/";
const outputDir = path.join(__dirname, "..", "screenshots");

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--disable-features=SpellCheck,TranslateUI", "--lang=ja-JP", "--enable-webgl"],
  });
  const page = await browser.newPage();

  // Console ログ全取得
  page.on("console", (msg) => {
    console.log(`[console.${msg.type()}] ${msg.text()}`);
  });
  page.on("pageerror", (err) => {
    console.log(`[pageerror] ${err.message}`);
  });

  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  await page.evaluateHandle("document.fonts.ready");

  // 3D 初期化とパルス発生を待つため 4 秒待機
  await new Promise((r) => setTimeout(r, 4000));

  // canvas 状態を確認
  const diag = await page.evaluate(() => {
    const c = document.getElementById("neural-canvas");
    if (!c) return { found: false };
    const rect = c.getBoundingClientRect();
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    return {
      found: true,
      width: c.width,
      height: c.height,
      rectW: rect.width,
      rectH: rect.height,
      zIndex: getComputedStyle(c).zIndex,
      position: getComputedStyle(c).position,
      webglOK: !!gl,
      webglVendor: gl ? gl.getParameter(gl.VENDOR) : null,
      webglRenderer: gl ? gl.getParameter(gl.RENDERER) : null,
      hasNeural3d: !!window.__neural3d,
    };
  });
  console.log("[diag]", JSON.stringify(diag, null, 2));

  // viewport スクショ（fullPage: false で fixed 背景を撮る）
  const filePath = path.join(outputDir, "hero_viewport_debug.png");
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`[OK] ${filePath}`);

  await browser.close();
})();
