/**
 * セクションごとの viewport スクショ
 * 目的: fixed 背景の canvas が全セクションで透けて見えているか確認
 * 使い方: node scripts/screenshot-sections.cjs
 */
const puppeteer = require("puppeteer");
const path = require("path");

const url = "http://localhost:4321/anom-corporate/";
const outputDir = path.join(__dirname, "..", "screenshots");

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--disable-features=SpellCheck,TranslateUI", "--lang=ja-JP"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  // reduced-motion を無効化（ニューロンのパルスを撮るため）
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "no-preference" },
  ]);
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  await page.evaluateHandle("document.fonts.ready");

  // 3D 初期化 + パルス発生の時間を確保
  await new Promise((r) => setTimeout(r, 3000));

  // 各セクションの Y 座標をチェック
  const scrollPoints = [
    { name: "01_hero", y: 0 },
    { name: "02_about", y: 900 },
    { name: "03_usecases", y: 1800 },
    { name: "04_services", y: 2700 },
    { name: "05_faq", y: 3600 },
    { name: "06_download", y: 4500 },
    { name: "07_finalcta_footer", y: 5400 },
  ];

  for (const sp of scrollPoints) {
    await page.evaluate((y) => window.scrollTo(0, y), sp.y);
    // スクロール後の canvas 再描画を待つ
    await new Promise((r) => setTimeout(r, 1200));
    const filePath = path.join(outputDir, `sections_${sp.name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`[OK] ${sp.name} (y=${sp.y}) -> ${filePath}`);
  }

  await browser.close();
})();
