/**
 * スクリーンショット撮影スクリプト
 *
 * 使い方:
 *   node scripts/screenshot.cjs [URL] [ページ名]
 *
 * 例:
 *   node scripts/screenshot.cjs http://localhost:4321 top
 *   node scripts/screenshot.cjs http://localhost:4321/contact contact
 *
 * デフォルト: http://localhost:4321 / ページ名 "page"
 *
 * 出力先: screenshots/ フォルダ
 *   - {ページ名}_pc.png      (1280x800)
 *   - {ページ名}_tablet.png  (768x1024)
 *   - {ページ名}_sp.png      (375x667)
 */

const puppeteer = require("puppeteer");
const path = require("path");

// コマンドライン引数
const url = process.argv[2] || "http://localhost:4321";
const pageName = process.argv[3] || "page";

// デバイスサイズ定義
const devices = [
  { name: "pc", width: 1280, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "sp", width: 375, height: 667 },
];

const outputDir = path.join(__dirname, "..", "screenshots");

(async () => {
  // ブラウザ起動
  const browser = await puppeteer.launch({ headless: true });

  for (const device of devices) {
    const page = await browser.newPage();

    // ビューポート設定
    await page.setViewport({
      width: device.width,
      height: device.height,
    });

    // ページ読み込み（ネットワークが静かになるまで待つ）
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

    // フォント読み込み完了を待つ
    await page.evaluateHandle("document.fonts.ready");

    // アニメーション等の描画を少し待つ
    await new Promise((r) => setTimeout(r, 500));

    // フルページスクリーンショットを撮影
    const filePath = path.join(outputDir, `${pageName}_${device.name}.png`);
    await page.screenshot({ path: filePath, fullPage: true });

    console.log(`[OK] ${device.name} (${device.width}x${device.height}) -> ${filePath}`);

    await page.close();
  }

  await browser.close();
  console.log("\n撮影完了");
})();
