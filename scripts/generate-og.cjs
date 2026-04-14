/**
 * OGP画像生成スクリプト
 * HTMLからPuppeteerで1200x630のOGP画像を生成する
 */

const puppeteer = require("puppeteer");
const path = require("path");

const outputPath = path.join(__dirname, "..", "public", "og-image.png");

// OGP画像のHTML（インライン）
const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px;
      height: 630px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1B2A4A 0%, #0F1A2E 50%, #111111 100%);
      font-family: 'Inter', 'Noto Sans JP', sans-serif;
      overflow: hidden;
    }
    .container {
      text-align: center;
      color: white;
    }
    .logo {
      font-size: 80px;
      font-weight: 700;
      letter-spacing: 8px;
    }
    .tagline {
      margin-top: 16px;
      font-size: 16px;
      letter-spacing: 6px;
      color: rgba(255,255,255,0.5);
      font-weight: 400;
    }
    .description {
      margin-top: 40px;
      font-size: 24px;
      color: rgba(255,255,255,0.85);
      font-weight: 400;
      line-height: 1.6;
    }
    .url {
      margin-top: 32px;
      font-size: 16px;
      color: rgba(255,255,255,0.4);
      letter-spacing: 2px;
    }
    /* 背景の幾何学装飾 */
    .geo {
      position: absolute;
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 2px;
    }
    .geo-1 { width: 200px; height: 200px; top: 40px; left: 60px; transform: rotate(15deg); }
    .geo-2 { width: 120px; height: 120px; bottom: 80px; right: 100px; transform: rotate(-30deg); }
    .geo-3 { width: 80px; height: 80px; top: 100px; right: 200px; border-radius: 50%; }
  </style>
</head>
<body>
  <div class="geo geo-1"></div>
  <div class="geo geo-2"></div>
  <div class="geo geo-3"></div>
  <div class="container">
    <div class="logo">ANOM</div>
    <div class="tagline">AUTONOMOUS + MINIMALISM</div>
    <div class="description">秋田の中小企業のDX・AI導入を<br>戦略から定着まで伴走支援</div>
    <div class="url">anom-ai.com</div>
  </div>
</body>
</html>
`;

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // OGP画像サイズ
  await page.setViewport({ width: 1200, height: 630 });
  await page.setContent(html, { waitUntil: "networkidle0" });

  // フォント読み込み待ち
  await page.evaluateHandle("document.fonts.ready");
  await new Promise((r) => setTimeout(r, 500));

  await page.screenshot({ path: outputPath });
  console.log("[OK] OGP画像を生成しました:", outputPath);

  await browser.close();
})();
