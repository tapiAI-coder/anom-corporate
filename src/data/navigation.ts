// ナビゲーションリンク定義
export const navLinks = [
  { label: "ホーム", href: "/" },
  { label: "サービス", href: "/services" },
  { label: "料金", href: "/pricing" },
  { label: "代表紹介", href: "/about" },
  { label: "会社概要", href: "/company" },
  { label: "お問い合わせ", href: "/contact" },
] as const;

// サイト基本情報
export const siteConfig = {
  name: "ANOM",
  tagline: "AUTONOMOUS + MINIMALISM",
  description:
    "秋田の中小企業の無駄をなくし、AI導入で定型業務を削減。適材適所の人材配置で売上向上を実現するDX・AIコンサルティング。",
  url: "https://anom-ai.com",
  ogImage: "/og-image.png",
} as const;
