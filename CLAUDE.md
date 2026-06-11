# ANOM コーポレートサイト — プロジェクト CLAUDE.md

> このファイルは **anom-corporate リポジトリの技術司令塔** です。
> ブランド・事業方針は `../../CLAUDE.md`（claude 秘書 プロジェクト司令塔）と `~/.claude/CLAUDE.md`（グローバル）を参照してください。
> このファイルは **サイト実装に関する技術仕様のみ** を扱います。
>
> 旧バージョン（v1/v2 時代のルール）は `CLAUDE.md_bak_v2` に保存済み。
> 本ファイルは **v3 ウェブサイト設計ブリーフ（2026-04-22 確定版）** に基づく。

---

## 0. 絶対ルール（全実装で必ず守る）

1. **Tailwind CSS を使用する** — スタイリングは全て Tailwind CSS v4 のユーティリティクラスで行う。独自 CSS は最小限
2. **レスポンシブ対応必須** — モバイルファーストで `sm:` `md:` `lg:` ブレークポイントを適切に使う
3. **コメントは日本語で書く** — コード内コメントは全て日本語
4. **ブランドアセットに準拠** — `事業計画/ブランドアセット/` の色・フォント・ロゴ使用ルールに沿う。自己判断で変えない
5. **既存ファイル編集前にバックアップ** — `_bak` 付きで手動保存してから書き換える
6. **実装後はローカル確認** — `npm run dev` で起動し、Puppeteer スクリーンショット（PC/タブレット/スマホ）で目視確認
7. **大規模変更はフェーズ分割** — フェーズごとにユーザー承認を得てから次へ

---

## 1. リポジトリ概要

- **パス:** `C:/Users/tapi2/OneDrive/Desktop/claude 秘書/事業計画/anom-corporate`
- **GitHub:** `https://github.com/tapiAI-coder/anom-corporate`
- **本番 URL:** `https://tapiai-coder.github.io/anom-corporate`
- **デプロイ:** GitHub Pages（`base: "/anom-corporate"`）
- **Node.js:** v24.14.1
- **パッケージマネージャ:** npm 11.11.0（固定。yarn / pnpm 不使用）

---

## 2. サイト構成

### 2-1. ホームページ（/）— 7 セクション構成

1. **Hero** — ニューロン伝達アニメーション + キャッチコピー
2. **01 / ABOUT** — ANOM とは
3. **02 / USECASES** — 導入事例・活用シーン
4. **03 / SERVICES & PRICING** — サービス紹介と料金（`#services` アンカー）
5. **04 / FAQ** — よくある質問
6. **05 / RESOURCES** — リソース集（現在は準備中表示）
7. **06 / CONTACT** — お問い合わせ

### 2-2. サブページ

| ルート | 役割 |
|---|---|
| `/about` | 代表紹介 |
| `/company` | 会社概要 |
| `/contact` | お問い合わせ |
| `/thanks` | 送信完了 |

### 2-3. ヘッダーナビゲーション（3 項目のみ）

- 代表紹介 → `/about`
- 会社概要 → `/company`
- お問い合わせ → `/contact`

> **料金・サービス** はホーム内 `#services` アンカーに統合済み（ナビからは削除）

---

## 3. ターゲット・サービス

### 3-1. ターゲットユーザー

- **ペルソナ:** 秋田の中小企業 経営者・意思決定者
- **年齢層:** 30〜50 代男性が中心
- **重視する印象:** 信頼感・本物感・知性 > トレンディ・ポップ
- **行動特性:** 「効果がある証拠」と「実績」で判断する層

### 3-2. サービス内容

#### 月額顧問
- 経営・事業判断への AI / DX 相談
- ツール選定の中立アドバイス
- 月次の振り返りと次アクション設計
- 導入後の継続サポート

#### プロジェクト型
- 現状診断（DX・AI 準備度調査）
- 業務フロー改善設計
- AI ツール導入支援（設定・研修）
- 導入後の定着サポート

---

## 4. デザインシステム（v3）

### 4-1. カラー・テーマ

| トークン | 値 | 用途 |
|---|---|---|
| ベース背景 | `#0a0a0a` | 全ページ基調（ほぼ純黒） |
| サーフェス | `bg-white/5 + backdrop-blur-md` | カード（Glassmorphism） |
| ボーダー | `border-white/10` | 薄い境界線 |
| アクセントA | `#3b82f6`（blue-500） | グラデーション起点 |
| アクセントB | `#8b5cf6`（violet-500） | グラデーション終点 |
| 本文 | `text-white` | 主要テキスト |
| 本文（弱） | `text-white/70` | 副次テキスト（WCAG AA 確保） |
| 補助 | `text-white/40` | ラベル・メタ情報 |

**グラデーション記法例:**
```css
bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]
```

> **旧 v1/v2 の色トークン**（`--color-dark-bg` `--color-accent` 等）は v3 で置き換え。旧ルールは `CLAUDE.md_bak_v2` 参照。

### 4-2. レイアウト

- **Bento Grid（可変グリッド）** でコンテンツを独立カードとして配置
- **セクション間余白:** `py-24 md:py-32 lg:py-40`
- **カード内パディング:** `p-6 md:p-8` 以上
- **最大幅:** `max-w-7xl` で中央寄せ
- **モバイル:** 1 カラムにスタック（`lg:grid-cols-N` で PC 切替）

### 4-3. メインビジュアル — ニューロン伝達アニメーション

**コンセプト:** 暗闇（導入前）→ 光の連鎖（AI 変革後）の対比を UX で体験させる。

**基本仕様:**
- 黒背景に神経伝達ネットワークが広がるビジュアル
- スクロール連動でニューロンがスパークしながら拡散
- ニューロン密度がスクロール深度に比例して増加（まばら → 密 → スパーク連鎖）
- スパークの光がテキストカードの背後を通過し、光で文字が浮かび上がる演出

**実装制約:**
- **React Three Fiber（R3F）は使用しない** — Astro Islands との相性問題回避
- **`<canvas>` + vanilla TypeScript** で実装
- **Astro Island にしない** — 純粋な `<canvas>` + `<script>` タグでロジック記述
- **60fps 維持** — `requestAnimationFrame` ベース

**パフォーマンス要件:**

| 環境 | ノード数上限 | カーソル連動 | DPR 上限 |
|---|---|---|---|
| PC | 150 | 有効 | 2 |
| モバイル | 75 | 無効 | 2 |

**スパーク色:** `#3b82f6` → `#8b5cf6` グラデーション

### 4-4. インタラクション仕様

#### エントリーアニメーション（Framer Motion v12）

```tsx
// 各要素
initial={{ y: 20, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
// 複数要素
staggerChildren: 0.1  // 0.1s 間隔
```

#### ホバーエフェクト

```tsx
whileHover={{ scale: 1.02, y: -5 }}
// + 境界線がブルー→パープルのグラデーションで発光
// + box-shadow Glow 効果
```

#### テキストカード照射演出

- ニューロンの光がカード位置を通過したタイミングで文字がフェードイン
- `IntersectionObserver` + スクロール進捗値でトリガー

#### カーソル連動（PC のみ）

- カーソルがニューロンノードに近づくと、ノードが引き寄せられるように反応
- 半径 **150px** 以内のノードが対象

#### スムーズスクロール

- **Lenis**（慣性スクロール）を導入

### 4-5. タイポグラフィ

| 用途 | フォント | 理由 |
|---|---|---|
| 英字（見出し・ロゴ周り） | **Inter** | ロゴの幾何学的サンセリフに近い |
| 日本語（本文） | **Noto Sans JP** | Inter との相性が良く可読性が高い |
| タグライン | `letter-spacing` 広め + 細め weight | ロゴの「AUTONOMOUS + MINIMALISM」表現に準拠 |
| 料金表示 | `text-3xl font-bold` | 強調 |

Google Fonts 経由で読み込み。

### 4-6. アイコン

- **Lucide React** を使用
- `strokeWidth={1.5}`（細身で上品）

---

## 5. テックスタック

| 領域 | 技術 | バージョン | 状態 |
|---|---|---|---|
| Framework | Astro（Islands Architecture） | 6.1.6 | 導入済 |
| UI Library | React | 19.2.5 | 導入済 |
| Styling | Tailwind CSS v4 + @tailwindcss/vite | 4.2.2 | 導入済 |
| Animation | Framer Motion | 12.38.0 | 導入済 |
| Sitemap | @astrojs/sitemap | 3.7.2 | 導入済 |
| Screenshot | Puppeteer | 24.40.0 | 導入済 |
| 3D / Graphics | Three.js（`<canvas>` + vanilla） | — | **要導入** |
| Smooth Scroll | Lenis | — | **要導入** |
| Icons | Lucide React（strokeWidth 1.5） | — | **要導入** |

### 重要な技術的制約

1. **Astro プロジェクト** — Next.js ではない。ページルーティングは `src/pages/` ベース
2. **React コンポーネントは Astro Islands として動作** — `client:load` / `client:visible` / `client:idle` ディレクティブ必須
3. **Tailwind CSS v4** — `tailwind.config.js` ではなく `src/styles/global.css` 内の `@theme` ブロックで設定
4. **@tailwindcss/vite** で統合（`@astrojs/tailwind` は v4 非対応のため不使用）
5. **GitHub Pages デプロイ** — `astro.config.mjs` の `base: "/anom-corporate"` を維持。アセットパスは `withBase()` ヘルパー経由
6. **public/ アセットも base パスを含める** — `/anom-corporate/textures/noise.svg` のように
7. **Three.js は R3F を使わない** — `<canvas>` に直書き or 軽量ラッパーで実装
8. **フォーム送信:** Web3Forms（既存実装を維持）
9. **パスエイリアス:** `@/*` → `./src/*`（tsconfig.json）

---

## 6. フォルダ構成

```
anom-corporate/
├── CLAUDE.md                  ← このファイル
├── CLAUDE.md_bak_v2           ← 旧ルール（v1/v2 時代）
├── astro.config.mjs
├── package.json
├── docs/                      ← 設計ドキュメント（upgrade-plan.md 等）
├── public/
│   └── textures/              ← ノイズ・背景テクスチャ
├── scripts/                   ← 開発用（screenshot.cjs 等）
├── screenshots/               ← Puppeteer 出力先
├── src/
│   ├── components/
│   │   ├── redesign/          ← v2 で新設（現行。v3 で強化）
│   │   │   ├── HeroV2.tsx
│   │   │   ├── HeroBackgroundV2.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   ├── UseCasesSection.tsx
│   │   │   ├── ServicesPricingSection.tsx
│   │   │   ├── FAQSection.tsx
│   │   │   ├── DownloadSection.tsx
│   │   │   └── FinalCTASection.tsx
│   │   ├── ui/                ← shadcn/ui 汎用
│   │   └── *.astro            ← レガシー（Header/Footer/SEOHead など）
│   ├── data/                  ← 静的データ（navigation, services, pricing, company）
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/                 ← ルーティング（.astro ファイル）
│   ├── scripts/               ← vanilla TS（neural-animation.ts 等）
│   └── styles/
│       └── global.css         ← @theme トークン定義
```

---

## 7. コンポーネント改修テンプレート

個別セクションの改修を依頼する際のベーステンプレート:

```markdown
CLAUDE.md を読んでください。

## ゴール
[対象コンポーネントのパス] を、デザインシステム（CLAUDE.md セクション 4）に
準拠した UI に書き換えてください。

## 具体的な実装要件
1. Tailwind CSS v4 で Bento Grid レイアウトを構築
   （各カードに bg-white/5 + backdrop-blur-md）
2. Framer Motion v12 でスクロール時の浮き上がりアニメーション
   （staggerChildren）
3. ホバー時にカード境界線がグラデーションで光るエフェクト
4. アイコンは Lucide React（strokeWidth={1.5}）
5. 余白: セクション間 py-24 以上、カード内 p-6 以上

## 制約条件
- Astro Islands 構成を維持（client:load / client:visible ディレクティブ）
- 既存の props インターフェースを変更しない
- アクセシビリティ: aria-label、キーボードナビゲーション対応
- パフォーマンス: アニメーションは GPU レイヤー（transform/opacity のみ）
- GitHub Pages の base パス /anom-corporate を考慮したアセット参照

## 出力仕様
- 上書き保存（元ファイルと同じパス）
- 変更前のファイルを _bak 付きでバックアップ
```

---

## 8. 開発ワークフロー

### ローカル起動

```bash
npm run dev                     # デフォルト: http://localhost:4321/anom-corporate
npm run dev -- --port 4323      # ポート指定
```

### ビルド & プレビュー

```bash
npm run build
npm run preview
```

### スクリーンショット確認フロー

実装後は必ず以下で目視確認:

```bash
# 使い方
node scripts/screenshot.cjs [URL] [ページ名]

# 例
node scripts/screenshot.cjs http://localhost:4321 top
node scripts/screenshot.cjs http://localhost:4321/contact contact
```

出力ファイル（`screenshots/` 配下）:
- `{ページ名}_pc.png` — 1280x800
- `{ページ名}_tablet.png` — 768x1024
- `{ページ名}_sp.png` — 375x667

問題（余白崩れ・はみ出し・文字切れ等）を発見したら修正 → 再撮影 → 解消確認 → 次へ進む。

### ファイル編集ルール

- 既存ファイルを書き換える前に **`_bak` 付きでバックアップ**（手動）
- 大規模変更時はフェーズ分割し、フェーズごとにユーザー承認を得る

---

## 9. ブランドアセット

**参照元:** `../../事業計画/ブランドアセット/`

### ロゴファイル

| ファイル | 用途 |
|---|---|
| `ブランドアセット/ロゴデータ/ANOM メインロゴ.png` | メインロゴ（シンボル + テキスト + タグライン） |
| `ブランドアセット/ロゴデータ/シンボルマーク単体 SNSアイコン、ファビコン用.png` | ファビコン、OGP、SNSアイコン |
| `ブランドアセット/ブランドアセット.png` | ロゴバリエーション一覧 |

### ロゴ使用ルール

- **白背景:** ダークネイビー + ブラックのメインロゴ
- **ダーク背景（v3 の基調）:** 白抜きロゴ
- **シンボルマーク単体:** ファビコン、SNSアイコン、小スペース
- ロゴの色は変えない。使って良い組み合わせはブランドアセット.png に記載のもののみ

### ブランド制約

- ネイビー `#1B2A4A` は **ロゴ画像専用**。UI トークンとして使用しない
- フォント: Inter（英字）+ Noto Sans JP（日本語）

---

## 10. 参考リソース

- **Aceternity UI:** https://ui.aceternity.com/
- **Magic UI:** https://magicui.design/
- **Linear.app:** ミニマリズム＋ダークモードのベンチマーク（v2 までの基調）
- **v3 方針:** Linear の静謐な骨格 + Aceternity のリッチ装飾を融合

---

## 11. 既存コンテンツ & 刷新方針

- **テキスト原稿:** 既存サイトから移行済み（`src/data/*.ts` / 各コンポーネントに直書き）
- **画像素材:** 必要に応じて用意（現状は極少）
- **ロゴデータ:** あり（詳細は `src/components/Header.astro` 参照）
- **デザイン刷新の方針（v3）:** **土台として強化** — 既存 v2 コンポーネントファイルを流用しつつ、内部を Bento Grid + Glassmorphism + ニューロンビジュアル方向へ書き換える（見た目はほぼ刷新されるが、ファイル構造・props・テキストは維持）

---

---

## 12. v3 改修ロードマップ（フェーズ管理）

> コンテキスト圧縮で埋もれないよう、全フェーズをここに集約する。
> 各フェーズ着手前に必ずこのセクションを参照し、完了したものにチェックを入れること。

### Phase A' — Hero リッチ入場アニメ ✅ 完了（2026-04-24）
- 純黒背景、stars/NeuralBackground 廃止
- キャッチコピー文字ごと blur→clear、ANOM 1 文字ずつ spring 現出
- 全体 2.5 秒テンポ

### Phase C — About 光点球体 Orb ✅ 完了（2026-04-24）
- 緯度経度グリッド 7200 点（PC）/ 1800 点（モバイル）
- マウス近接で輝度ブースト + 微押し出し
- 要確認: Windows「アニメーションの表示」ON で動作検証

### Phase D — ホームページ残セクション改修 ✅ 完了（2026-04-28）
改修内容:
- 全 5 セクション（UseCases / ServicesPricing / FAQ / Download / FinalCTA）を v3 デザインシステムに統一
- `style={{ fontFamily, color }}` を撤廃 → Tailwind v4 カスタムフォントクラス（`font-v2-display` / `font-v2-sans` / `font-v2-mono`）と `text-white/{op}` クラスへ移行（`fontFamily` 由来 Hydration 警告は根本解消）
- カードを `glass-card-v3` + `gradient-border-hover` の Glassmorphism 化
- 番号ラベルを `gradient-text-v3`（青→紫）に統一
- CTA ボタンを `bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]` + glow shadow に格上げ
- FinalCTA に radial gradient ambient glow 追加
- FAQ open 時に左端グラデーションマーカー + bg-white/[0.02] ハイライト

**残課題（Phase F へ持ち越し）:**
- Framer Motion `initial="hidden"` 由来の Hydration 警告（opacity/transform の SSR/CSR 文字列 vs 数値差分）。`whileInView` への移行か `suppressHydrationWarning` 検討

### Phase E — UI/UX Pro Max（ボタン・カード強化） ⬜ 未着手
- CTA ボタン: hover 時のグラデーション発光・ripple・スプリングアニメーション強化
- カード: Glassmorphism 深化（境界線グラデーション発光、hover 時 box-shadow glow）
- マイクロインタラクション: アコーディオン（FAQ）・ホバートランジション統一
- スキル活用候補: `UI/UX Pro Max` スキルでデザインブラッシュアップ
- 対象: 全セクションのインタラクティブ要素を横断的に底上げ

### Phase F — カラー・スタイル統一 ⬜ 未着手
- CSS 変数（`--color-v2-*` / `--font-v2-*`）の全コンポーネント統一確認
- `fontFamily` を style prop でなく Tailwind クラスで管理する方針への移行（Hydration 警告の根本解消）
- グラデーション（blue-500 → violet-500）の使用箇所を棚卸し・統一
- ダークテーマ基調の全セクション目視チェック（PC / タブレット / スマホ 3 解像度）

### Phase G — サブページ デザイン改修 ⬜ 未着手
対象ページ:
- `/about`（代表紹介）
- `/company`（会社概要）
- `/contact`（お問い合わせ）
- `/thanks`（送信完了）
- ヘッダー・フッター共通コンポーネントの v3 統一

### Phase H — デプロイ・本番確認 ⬜ 未着手
- `npm run build` でエラーゼロ確認
- GitHub Pages 本番 URL での目視確認
- OG 画像・meta 確認
- Core Web Vitals チェック

---

_最終更新: 2026-04-28 — Phase D 完了（5 セクション v3 統一 + Tailwind 移行）_
