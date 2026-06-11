/**
 * スクロール scrub 検証用スクショ
 * Hero セクション内で 0% / 50% / 100% の位置に停止し、各状態を撮影
 */
const puppeteer = require("puppeteer");
const path = require("path");

const url = "http://localhost:4326/anom-corporate/";
const outputDir = path.join(__dirname, "..", "screenshots");

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--autoplay-policy=no-user-gesture-required", "--lang=ja-JP"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  // reduced-motion を無効化（scrub を撮るため）
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "no-preference" },
  ]);
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  await page.evaluateHandle("document.fonts.ready");

  // 動画ロード + 初期化を待つ
  await new Promise((r) => setTimeout(r, 4000));

  // ビューポート高さ取得
  const viewportH = await page.evaluate(() => window.innerHeight);

  // Hero は min-h-screen なので、scroll 0 = progress 0、scroll viewportH = progress 1
  const scrollPoints = [
    { name: "scrub_00_start", y: 0, label: "0%（冒頭・光点散乱）" },
    { name: "scrub_01_mid", y: Math.round(viewportH * 0.5), label: "50%（組み上がり途中）" },
    { name: "scrub_02_end", y: viewportH, label: "100%（ロゴ完成）" },
  ];

  for (const sp of scrollPoints) {
    await page.evaluate((y) => window.scrollTo(0, y), sp.y);
    // scrub + video seek + next frame render まで少し待つ
    await new Promise((r) => setTimeout(r, 1500));
    const file = path.join(outputDir, `${sp.name}.png`);
    await page.screenshot({ path: file });
    console.log(`[OK] ${sp.name} y=${sp.y} ${sp.label} -> ${file}`);
  }

  await browser.close();
  console.log("scrub 検証完了");
})();
