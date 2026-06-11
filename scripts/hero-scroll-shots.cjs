/**
 * Hero scrolltelling のスクロール位置別スクリーンショット撮影
 *
 * 使い方:
 *   node scripts/hero-scroll-shots.cjs [URL]
 *
 * 出力: screenshots/hero_act1.png 〜 hero_act4.png
 */

const puppeteer = require("puppeteer");
const path = require("path");

const url = process.argv[2] || "http://localhost:4323/anom-corporate/";
const outputDir = path.join(__dirname, "..", "screenshots");

// 4幕のスクロール位置（hero-container は 400vh、進捗 = scrollY / (400vh - 100vh) = scrollY / 300vh）
// 進捗 0.10 → 幕1中央（CURRENT STATE）
// 進捗 0.35 → 幕2中央（THE TURNING POINT）
// 進捗 0.60 → 幕3中央（TRANSFORMATION）
// 進捗 0.85 → 幕4中央（朝・ロゴ）
const acts = [
  { name: "act1_night", progress: 0.10 },
  { name: "act2_predawn", progress: 0.35 },
  { name: "act3_sunrise", progress: 0.60 },
  { name: "act4_morning", progress: 0.88 },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--disable-features=SpellCheck,TranslateUI", "--lang=ja-JP"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // prefers-reduced-motion 無効化
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "no-preference" },
  ]);

  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  await page.evaluateHandle("document.fonts.ready");

  // フレームのプリロード完了を待つ（1秒）
  await new Promise((r) => setTimeout(r, 1500));

  for (const act of acts) {
    // 進捗 → スクロール量を計算してスクロール
    await page.evaluate((p) => {
      const section = document.getElementById("hero-section");
      if (!section) return;
      const total = section.offsetHeight - window.innerHeight;
      window.scrollTo(0, total * p);
    }, act.progress);

    // active クラス発火 + CSS transition 完了を待つ（最長 1.5s + 余裕）
    await new Promise((r) => setTimeout(r, 2200));

    const filePath = path.join(outputDir, `hero_${act.name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`[OK] ${act.name} (progress=${act.progress}) -> ${filePath}`);
  }

  await browser.close();
  console.log("\n撮影完了");
})();
