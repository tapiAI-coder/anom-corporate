# Task: ANOMコーポレートサイト 再設計 v2

**作成日**: 2026-04-20
**ブランチ**: redesign-v2（前回実装は `84b5684 WIP: Linear風デザイン第1弾（アーカイブ）` でコミット済み）
**目的**: Linear.app / Apple.com 水準の質感とアニメーションに引き上げる

---

## Goal（何を達成するか）

「実績はまだ少ないが、**佇まいで信頼を獲得できる**コーポレートサイト」を作る。Linear の精密さと Apple の余白・タイポの大胆さを取り込み、**AIスタートアップ風の派手さではなく、高級感・信頼感**で補う。

---

## 1. デザイン原則（Linear / Apple から抽出する質感）

### Linear から取り込む
- **深い黒 + 極細ボーダー**: #08090B 系の背景、`rgba(255,255,255,0.06)` 境界線。境界で空間を切る
- **Inter Variable の攻めた字詰め**: 見出しで `letter-spacing: -0.03em ~ -0.04em`、tracking広めのeyebrow（`0.25em`）との対比
- **イージング**: `cubic-bezier(0.16, 1, 0.3, 1)`（easeOutExpo）/ `cubic-bezier(0.22, 1, 0.36, 1)`（easeOutQuint）で、"止まり方"を丁寧に
- **マイクロインタラクション**: キーボードヒント、フォーカスリング、subtle underline animation
- **グラデーションボーダー**: 上端だけ `linear-gradient(to right, transparent, white/10, transparent)` で板のエッジに光を載せる

### Apple から取り込む
- **超大型タイポ**: Heroの主見出しを `clamp(56px, 9vw, 128px)` でスケール
- **セクション間の大胆な余白**: デスクトップで縦 `160~200px`、緩急をつける（短いセクション→長いセクション）
- **セクションごとの背景切り替え**: 黒 / 白 / 薄グレーを交互に、"章が変わった"ことを色で示す
- **静かなテキスト中心のリード**: 装飾ではなく言葉で納得させる構成
- **Feature rows**: 左右交互に"画像 + テキスト"が並ぶサービス紹介パターン

### ANOM独自の縛り
- **人物写真ゼロ**（NG）。代わりに抽象グラデーションメッシュ / ロゴモノグラム / プロセス図解で埋める
- **SaaS固有名ゼロ**（NG）。抽象語彙で表現
- **「秋田から」の語り**: 地に足がついた信頼感。Apple的な冷たさではなく、静かな温度を残す

---

## 2. デザイントークン再定義（現状 → 新）

### カラー（ダークゾーン）

| 用途 | 現状 | 新 | 理由 |
|---|---|---|---|
| 背景 | #0d1117 | **#08090B** | 一段深く。Linear基準に寄せる |
| 面 | — | **#0F1014** | カード背景に1トーン明るい面を追加 |
| テキスト | #E8E8F0 | **#F5F5F7** | Apple基準、わずかに温度を足す |
| サブ | #6B6B80 | **#86868B** | Apple基準 |
| ボーダー | 0.06 | **0.08 / 0.12 (hover)** | 少しだけ見える強さに |
| アクセント | #6366f1 | **#5E6AD2** | Linear基準の紫系インディゴ |
| アクセント(hover) | #a5b4fc | **#7B8CFF** | 透過で浮かせる用 |
| グロー | rgba(99,102,241,0.10) | **rgba(94,106,210,0.14)** | ほんの少し濃く |

### カラー（ライトゾーン）

| 用途 | 現状 | 新 |
|---|---|---|
| 背景 | #FAFAFA | **#F5F5F7**（Apple基準） |
| 面 | #FFFFFF | #FFFFFF |
| ボーダー | #E4E4E7 | **#E5E5EA**（Apple基準） |
| テキスト | #111118 | **#1D1D1F**（Apple基準） |
| サブ | #6B6B80 | **#6E6E73**（Apple基準） |
| アクセント | #4f46e5 | #4A5CD4 |

### タイポグラフィ

新規トークン:
```
--font-display: 'Inter', 'Inter Tight', system-ui  /* 見出し用 */
--font-sans:    'Inter', 'Noto Sans JP', system-ui /* 本文用 */
--font-mono:    'JetBrains Mono', 'SF Mono', monospace /* 数値・kbd */

/* 見出しスケール（clampでfluid typography） */
--text-display: clamp(3.5rem, 9vw, 8rem)    /* 56-128px  Hero h1 */
--text-h1:      clamp(2.25rem, 5vw, 4rem)   /* 36-64px   大見出し */
--text-h2:      clamp(1.75rem, 3.5vw, 2.5rem) /* 28-40px セクション見出し */
--text-h3:      clamp(1.25rem, 2vw, 1.5rem) /* 20-24px サブ見出し */
--text-lead:    clamp(1.0625rem, 1.5vw, 1.25rem) /* 17-20px リード文 */
--text-body:    15px / leading 1.7
--text-sm:      13.5px
--text-eyebrow: 12px / 600 / tracking 0.25em / uppercase

/* 字詰め */
--tracking-tight:  -0.03em  /* h1 / h2 */
--tracking-tighter: -0.04em /* Display */
--tracking-eyebrow: 0.25em
```

### スペーシング（8px グリッド）
```
--space-section-y: clamp(5rem, 10vw, 12rem)   /* 80-192px */
--space-section-x: clamp(1rem, 5vw, 3rem)     /* 16-48px */
--space-card-p:    clamp(1.75rem, 3vw, 2.5rem) /* 28-40px */
--space-stack-sm: 0.5rem  /* 8 */
--space-stack-md: 1rem    /* 16 */
--space-stack-lg: 2.5rem  /* 40 */
--space-stack-xl: 4rem    /* 64 */
```

### イージング・Duration
```
--ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1)
--ease-out-quint:  cubic-bezier(0.22, 1, 0.36, 1)
--ease-in-out:     cubic-bezier(0.83, 0, 0.17, 1)

--dur-fast:  150ms  /* icon hover, color transition */
--dur-base:  300ms  /* button, link */
--dur-slow:  500ms  /* card reveal */
--dur-xslow: 800ms  /* scroll reveal */
```

### 角丸・シャドウ
```
--radius-sm: 8px
--radius-md: 12px  /* カード */
--radius-lg: 16px  /* 大カード */
--radius-pill: 9999px

/* ダークゾーン用シャドウ（グロー） */
--shadow-glow-sm: 0 0 24px rgba(94,106,210,0.08)
--shadow-glow-md: 0 0 48px rgba(94,106,210,0.12)
/* ライトゾーン用（控えめ） */
--shadow-light-sm: 0 1px 2px rgba(0,0,0,0.04)
--shadow-light-md: 0 4px 16px rgba(0,0,0,0.06)
```

---

## 3. アニメーション戦略

### 3-1. ページ遷移（View Transitions API）
- `<ViewTransitions />` を `BaseLayout.astro` の `<head>` に追加（Astro標準）
- ロゴや現在ページindicator など、**固定要素に `transition:name`** を付与
- `transition:animate="fade"` をデフォルトに、Hero h1のみ `slide` を検討

### 3-2. Scroll Reveal（IntersectionObserver）
- `RevealOnScroll` コンポーネントを新設。`data-reveal` 属性と`data-reveal-delay` で制御
- 対応パターン: `fade-up` / `fade-in` / `scale-in` / `stagger`
- 初回のみ発火（再スクロールで繰り返さない）
- `prefers-reduced-motion` で無効化

### 3-3. マイクロインタラクション
- **ボタン**:
  - PillButton（ベタ塗り）: hover時に背景が微明るく、矢印が +2px translate、subtle scale(1.02)
  - GhostButton（枠線）: border-color 遷移、内側に微かなfill
- **カード**: hover時に `translateY(-2px)` + border強化 + 微グロー
- **リンク**: `text-underline-offset` を広げるアニメ（Linear風）
- **フォーム**: フローティングラベル、フォーカス時にaccentボーダー

### 3-4. Hero 演出
- 初回ロード: ロゴ → h1 → タグライン → lead → CTA の順に `stagger` (80-120ms間隔)
- 背景: radial-gradient 2層 + subtle noise（現状維持） + 浮遊要素は1個まで（現状の2個から削減）

### 3-5. Capabilities カルーセル
- 現行のロジック（JS + scroll-snap）は維持
- 各カードに scroll reveal（viewport入ったらfade-up）
- スクロール時の慣性イージングを `--ease-out-expo` に統一

### 3-6. 数値カウンター
- 「8カテゴリ」「月20-40時間削減」など、数字を **viewport 進入時にカウントアップ**
- Number Counter コンポーネント新設

### 3-7. Capability スライダー外の新アニメ
- **Feature rows** (サービスページ): 左画像 / 右テキストが `fade-up + slide-x` で順に入る
- **Process steps**: 連結線が左→右に伸びるアニメ（stroke-dasharray + dashoffset）

---

## 4. コンポーネント棚卸し

| コンポーネント | 判断 | 内容 |
|---|---|---|
| `BaseLayout` | **リファイン** | ViewTransitions有効化、Font preload、prefers-reduced-motion対応CSS |
| `Header` | **リファイン** | スクロール時blur強化、現在ページunderline（View Transition対応） |
| `Footer` | **リファイン** | 余白再配分、3カラム→2カラム or 左右フル幅、ロゴモノグラム追加 |
| `Hero` | **作り直し** | 装飾4種→2種に引き算、タイポ主役、stagger発火 |
| `ServiceCard` | **作り直し** | Bento Grid前提の可変サイズ、内側グロー、hover微浮き |
| `CapabilitySlider` | **維持＋改善** | 既存ロジック残し、reveal+タイポ改善 |
| `CTASection` | **リファイン** | Apple風大型タイポ、余白大胆に |
| `ContactForm` | **リファイン** | フローティングラベル、フォーカス時accent |
| `LineButton` | **維持** | 現状のままで十分 |
| `SEOHead` | **維持** | 変更不要 |
| — | **新設** | `SectionHeader`（eyebrow+title+divider+lead） |
| — | **新設** | `RevealOnScroll`（IntersectionObserverラッパー） |
| — | **新設** | `PillButton` / `GhostButton`（ボタン統一） |
| — | **新設** | `NumberCounter`（数値カウントアップ） |
| — | **新設** | `GradientMesh`（SVGグラデーションメッシュ装飾） |
| — | **新設** | `StatsRow`（数値を並べる信頼感パーツ） |
| — | **新設** | `ProcessSteps`（手順可視化、connector line付き） |
| — | **新設** | `FeatureRow`（左右交互の画像+テキスト） |

---

## 5. ページ別リデザイン方針

### `index.astro`（トップ）
1. **Hero**: ロゴ + Display h1「無駄を削ぎ落とし、AIで自走する組織へ。」+ lead + CTAペア。装飾は radial glow 2層のみ、幾何学図形は削除 or 1個に
2. **Mission**: 現状3カード → **横並びプロセス**（削減 → 再配置 → 売上）に変更。矢印connectorで関係性を視覚化
3. **Capabilities**: スライダー維持、入場アニメとタイポ改善
4. **Services**: Bento Grid継続、featuredカード(1枚目)の中に "戦略立案 → 診断 → 導入 → 定着" の4ステップ可視化
5. **【新規】Why ANOM**: 数値/ロジックで信頼感 — 例「1社への稼働時間 最低40時間/月」「伴走期間 3-6ヶ月」「対応領域 8カテゴリ」など。StatsRowで3-4個並べる
6. **CTA**: Apple風大型タイポ「無駄の"ない"会社を、一緒に。」+ ピル型ボタン

### `services.astro`
- Page hero (mini): eyebrow「Services」+ h1 + lead
- サービスごとに **FeatureRow**（左右交互、5つのサービス）
- 途中に ProcessSteps で伴走の流れを挿入
- ページ最下部CTA

### `pricing.astro`
- Page hero (mini)
- 2-3プラン並列カード（月額顧問型 / プロジェクト型）
- 機能比較テーブル（ライトゾーン、細線）
- FAQ（disclosure/accordion — Radixベース or details要素）

### `about.astro`
- Page hero: 代表名 + eyebrow「About」+ lead
- Story 長文パート（なぜ秋田で / なぜDXか — 読ませる一人称文）
- Timeline（経歴）
- "秋田と関東の差をなくす"ミッションの掘り下げ

### `company.astro`
- ライトゾーンメイン、細線テーブルで会社情報
- ロゴモノグラム中央配置
- 数値は StatsRow

### `contact.astro`
- 2カラム（md以上）: 左に説明 + LINE CTA / 右にフォーム
- フォームはフローティングラベル、submit時の送信アニメ
- スマホは縦積み

### `thanks.astro`
- 中央大見出し + 戻るボタンのみのミニマル構成
- subtle glow

---

## Phases（検証可能な粒度で分割）

- [ ] **Phase 0**: Linear.app / Apple.com 調査、findings.md に具体値を記録
- [ ] **Phase 1**: デザイントークン再定義（global.css刷新）+ BaseLayout（View Transitions, font preload, reduced-motion）
- [ ] **Phase 2**: 基盤コンポーネント新設（SectionHeader / RevealOnScroll / PillButton / GhostButton / NumberCounter / GradientMesh / StatsRow / ProcessSteps / FeatureRow）+ デモページで挙動確認
- [ ] **Phase 3**: Header / Hero / Footer を新デザインで作り直し
- [ ] **Phase 4**: トップページ残りセクション（Mission / Capabilities / Services / 【新】Why ANOM / CTA）
- [ ] **Phase 5**: services.astro / pricing.astro リデザイン
- [ ] **Phase 6**: about.astro / company.astro / contact.astro / thanks.astro リデザイン
- [ ] **Phase 7**: 仕上げ（View Transitions 微調整、パフォーマンス / Lighthouse / モバイル最終詰め）

各Phase終わりに `npm run dev` 起動 → `node scripts/screenshot.cjs` でPC(1280)/Tablet(768)/SP(375) を撮影 → 目視確認 → git commit。

---

## Decisions（決定事項）

| Decision | Rationale | Date |
|---|---|---|
| 背景を #0d1117 → #08090B に深化 | Linear基準に寄せ、面(#0F1014)との階層を作るため | 2026-04-20 |
| Apple系テキスト色（#F5F5F7 / #86868B / #1D1D1F / #6E6E73）を採用 | 微妙な温度感で高級感が出る | 2026-04-20 |
| アクセントを #6366f1 → #5E6AD2 に | Linear公式アクセントに寄せる | 2026-04-20 |
| Bento Grid / 幾何学図形は削減 or 引き算 | 現状は装飾過多。Appleのように"余白で効かせる"方針 | 2026-04-20 |
| Hero の浮遊幾何学図形は削除 or 1個に | 注意が散るため。タイポ主役 | 2026-04-20 |
| 画像戦略: まずSVGグラデーションメッシュで統一 | 3Dレンダ/CGは後工程。まず質感を揃える | 2026-04-20 |
| shadcn/ui は必要最小限（disclosure等）に限定 | JSバンドルを増やさない | 2026-04-20 |

---

## Errors Encountered

| Error | Attempt | Resolution |
|---|---|---|
| — | — | — |

---

## Risks / 懸念

1. **Astro 6.x + View Transitions の動作**: 互換性要検証。Phase 1 で先に確認
2. **Noto Sans JP + Inter のCLS**: `font-display: swap` + preload、サブセット化で対策
3. **Scroll-driven animation の重さ**: モバイル検証必須、`prefers-reduced-motion` で全停止
4. **GitHub Pages サブパス (`/anom-corporate/`)**: `withBase()` ロジックを壊さない。新コンポーネントでも徹底
5. **実装中の見た目混在**: Phase単位で崩れた状態になる。毎Phase後にcommit、ブランチで巻き戻し可能に
6. **画像リソース不足**: 3Dレンダ等を使わない判断をしたので、SVGメッシュの質でデザイン品質が決まる。時間を取って作り込む
7. **トークン変更で既存コンポーネントが崩れる**: Phase 1 で global.css を変えたら、一度 `npm run dev` で全ページ崩れ確認、後続Phaseで順次修正

---

## Success Criteria（成功基準）

- [ ] ユーザーがLinear/Appleのスクリーンショットと並べて「質感が近づいた」と感じる
- [ ] 全ページでscroll reveal / View Transitions / hover interaction が破綻なく動作
- [ ] Lighthouse: Performance 90+, Accessibility 95+, Best Practices 95+（モバイル基準）
- [ ] モバイル375pxで文字切れ・はみ出しゼロ
- [ ] `prefers-reduced-motion` で全アニメーション無効化
- [ ] 実績数の乏しさが"静かな佇まい"で補われている（主観評価）
- [ ] ANOMミッション（無駄削減 → 適材適所 → 売上向上）が構造的に読み取れる
- [ ] ブランドNG（人物写真・SaaS固有名・AIスタートアップ風派手さ）に一切抵触しない
