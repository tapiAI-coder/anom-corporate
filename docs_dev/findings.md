# Findings — redesign-v2 調査メモ

**用途**: リファレンスから抽出した具体的な質感データを蓄積するファイル。Phase 0で本格調査するまでは、引継ぎ資料と現状実装から読み取った推定値を記録。

---

## 現状実装のサマリ（確認済み）

- **ブランチ**: redesign-v2（前回実装コミット済み、安全に上書き可能）
- **スタック**: Astro 6.1.6 / Tailwind CSS v4 (@tailwindcss/vite) / React 19 / TypeScript strict
- **デプロイ**: Cloudflare Pages（※ HANDOFFはGitHub Pagesと記載だが、プロジェクトCLAUDE.mdは Cloudflare Pages と記載 — 要確認）
- **既存ui/フォルダ**: 空（shadcn未導入）
- **画像アセット**: ロゴ png / noise.svg が public/ 配下に用意済み

## 現状のHero課題（src/components/Hero.astro を読んで）

- 背景装飾が **4種類重なっている**（grid + geo×2 + glow×2 + gradient overlay）→ Apple的引き算を採用予定
- ロゴ `filter: invert(1) mix-blend-mode: screen` の白抜きは有効 — 継続
- `animate-fade-in-up` を `animation-delay: 1s` で個別指定 → stagger方式に変更予定
- タイポ: h1 `text-5xl md:text-7xl` → Display スケール(`clamp(3.5rem, 9vw, 8rem)`)へ拡張
- フォント tracking `[0.15em]` は Display 基準では詰めすぎ（`-0.04em` に）

## 現状のglobal.css課題

- `@theme` のトークンは色のみ。タイポ / spacing / easing / duration 未定義
- `.dark-zone` `.glass-card` `.glow-hover` は有用 — 継続
- ノイズテクスチャ opacity 0.04 は良い加減
- イージングが `ease` と `ease-out` しかない → カスタム3種を追加予定

---

## Linear.app から取り込む観察ポイント（要Phase 0で検証）

| 要素 | 推定値 / 観察 |
|---|---|
| 背景色 | 黒寄りの超深いネイビーブラック（#08090B ±） |
| アクセント | `#5E6AD2` 系の紫インディゴ |
| 見出しフォント | Inter Variable、-0.03em程度の詰め |
| 境界線 | `rgba(255,255,255,0.06 ~ 0.08)` |
| カードhover | 縦2px浮き、border強化、微グロー |
| ボタン | 半透明ガラス or ベタ塗り白、角丸 `8px` |
| イージング | `cubic-bezier(0.16, 1, 0.3, 1)` 的な止まり方 |
| スクロール演出 | viewport進入時のsubtle fade-up(staggered) |

## Apple.com から取り込む観察ポイント

| 要素 | 推定値 / 観察 |
|---|---|
| Hero タイポ | `clamp(56px, 9vw, ~128px)`、weight 600-700、tracking詰め |
| セクション余白 | デスクトップで縦 120-200px |
| 背景切り替え | 白 / 黒 / 薄グレー を章区切りで切り替え |
| テキスト色 | ダーク面 `#F5F5F7`、ライト面 `#1D1D1F`、サブ `#86868B / #6E6E73` |
| 画像戦略 | 超高精細 or 引きの画角で"余白"を強調。ANOMでは抽象メッシュで代替 |
| CTA | ピル型 `border-radius: 9999px`、ベタ塗り + ゴースト のペア |

---

## 検証が必要な項目（Phase 0 / Phase 1 で確認）

- [ ] Astro 6.1.6 の View Transitions API (`<ViewTransitions />`) 動作
- [ ] Tailwind v4 `@theme` で `clamp()` を含む変数を定義できるか
- [ ] `prefers-reduced-motion` 対応の一括切り替え手法
- [ ] Inter Variable vs Inter（static）のパフォーマンス差
- [ ] Noto Sans JP のサブセット化（日本語グリフを絞る）
- [ ] Cloudflare Pages か GitHub Pages か（デプロイ先再確認）

---

## 参考リソース

- 前回のデザインプラン（やらないことリファレンス）: `C:\Users\tapi2\.claude\plans\swift-discovering-shore.md`
- 前回セッション記録: `案件/セッション記録/2026-04-20_01.md`
- ブランドアセット: `事業計画/ブランドアセット/`
