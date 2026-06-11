// ベースパス（astro.config.mjs の base に対応）
// カスタムドメイン設定時は "" に戻す
const base = "/anom-corporate";

// パスにベースを付与するヘルパー
export function withBase(path: string): string {
  if (path === "/") return `${base}/`;
  return `${base}${path}`;
}

// ナビゲーションリンク定義
// v2 再設計で最小構成に整理（2026-04-22）:
//   - ホーム: ロゴクリックで戻れるため削除
//   - サービス / 料金: ホーム内「Services & Pricing」セクションに集約されたため削除
//   - 残す: 代表紹介 / 会社概要 / お問い合わせ（「誰が / どこに / どう連絡」の 3 軸）
export const navLinks = [
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
