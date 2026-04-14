// ベースパス（astro.config.mjs の base に対応）
// カスタムドメイン設定時は "" に戻す
const base = "/anom-corporate";

// パスにベースを付与するヘルパー
export function withBase(path: string): string {
  if (path === "/") return `${base}/`;
  return `${base}${path}`;
}

// ナビゲーションリンク定義
export const navLinks = [
  { label: "ホーム", href: withBase("/") },
  { label: "サービス", href: withBase("/services") },
  { label: "料金", href: withBase("/pricing") },
  { label: "代表紹介", href: withBase("/about") },
  { label: "会社概要", href: withBase("/company") },
  { label: "お問い合わせ", href: withBase("/contact") },
] as const;

// サイト基本情報
export const siteConfig = {
  name: "ANOM",
  tagline: "AUTONOMOUS + MINIMALISM",
  description:
    "秋田の中小企業の無駄をなくし、AI導入で定型業務を削減。適材適所の人材配置で売上向上を実現するDX・AIコンサルティング。",
  url: "https://tapiai-coder.github.io",
  ogImage: withBase("/og-image.png"),
} as const;
