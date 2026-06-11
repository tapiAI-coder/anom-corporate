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
  // --disable-features=SpellCheck: puppeteer ヘッドレスで a タグ等に表示される赤い波線を抑止
  // （実ユーザー環境では通常現れないため、スクショ専用の無効化）
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--disable-features=SpellCheck,TranslateUI", "--lang=ja-JP"],
  });

  for (const device of devices) {
    const page = await browser.newPage();

    // ビューポート設定
    await page.setViewport({
      width: device.width,
      height: device.height,
    });

    // Puppeteer ヘッドレスは prefers-reduced-motion: reduce を返すため、
    // 実ユーザー環境に合わせて明示的に no-preference にする
    // （これをしないとニューロンアニメのパルス等が止まる）
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "no-preference" },
    ]);

    // ページ読み込み（ネットワークが静かになるまで待つ）
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

    // フォント読み込み完了を待つ
    await page.evaluateHandle("document.fonts.ready");

    // spellcheck 属性を全要素で無効化（puppeteer ヘッドレス特有の赤波線抑止）
    // font-variant-emoji: text で、漢字の絵文字フォントフォールバック（例: 「無料」→🈚色絵文字）を抑止
    await page.evaluate(() => {
      document.documentElement.setAttribute("spellcheck", "false");
      document.documentElement.style.fontVariantEmoji = "text";
      document.querySelectorAll("*").forEach((el) => {
        if (el instanceof HTMLElement) {
          el.spellcheck = false;
          el.style.fontVariantEmoji = "text";
        }
      });
    });

    // ページ全体を一度スクロールして Framer Motion の useInView を発火させる
    // （once: true の IntersectionObserver は一度可視化されれば永続）
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let y = 0;
        const step = 200;
        const timer = setInterval(() => {
          const h = document.documentElement.scrollHeight;
          window.scrollBy(0, step);
          y += step;
          if (y >= h) {
            clearInterval(timer);
            resolve();
          }
        }, 80);
      });
      // スクロール終了後、トップに戻す（スクショはトップ基点で撮る）
      window.scrollTo(0, 0);
    });

    // アニメーション完了 + フォントレンダリング安定を待つ（1500 → 2000ms に拡大、スクロール後のリフロー吸収）
    await new Promise((r) => setTimeout(r, 2000));

    // フルページスクリーンショットを撮影
    const filePath = path.join(outputDir, `${pageName}_${device.name}.png`);
    await page.screenshot({ path: filePath, fullPage: true });

    console.log(`[OK] ${device.name} (${device.width}x${device.height}) -> ${filePath}`);

    await page.close();
  }

  await browser.close();
  console.log("\n撮影完了");
})();
