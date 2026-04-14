// Astro 設定ファイル
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // 本番サイトのURL（sitemap生成・OGPで使用）
  site: "https://tapiai-coder.github.io",
  // GitHub Pages のサブパス（カスタムドメイン設定時に "/" に戻す）
  base: "/anom-corporate",

  // インテグレーション
  integrations: [
    // React コンポーネント対応（shadcn/ui 用）
    react(),
    // サイトマップ自動生成（Phase 2で有効化）
    sitemap(),
  ],

  // Vite プラグイン
  vite: {
    plugins: [
      // Tailwind CSS v4（Viteプラグイン方式）
      tailwindcss(),
    ],
  },
});
