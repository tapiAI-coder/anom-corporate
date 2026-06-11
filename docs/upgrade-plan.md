# ANOM コーポレートサイト v3 アップグレード計画

> 作成日: 2026-04-22
> 基準仕様: `CLAUDE.md`（v3 確定版）
> 現状: v2 再設計完了（Phase 1〜6）。v3 で大規模デザイン強化を行う。
> 方針: **土台として強化** — 既存 v2 コンポーネントファイルを流用しつつ、内部を Bento Grid + Glassmorphism + ニューロンビジュアルに書き換え。

---

## 1. エグゼクティブサマリ

### 1-1. 現状の評価

v2 は **Linear 系ミニマル** の方向で完成している（`gap-0` + border 分割、単色アクセント `#7B8BDB`、平面的）。構造・テキスト・アニメーション基盤（Framer Motion）はすでに質が高く、v3 では **骨格を温存したまま装飾層を大幅強化** する。

### 1-2. v3 のコア変更点（5 本柱）

| # | 変更領域 | 現状 (v2) | 目標 (v3) |
|---|---|---|---|
| 1 | **背景ビジュアル** | パララックス blob + grid | ニューロン伝達アニメ（canvas） |
| 2 | **カードデザイン** | border 分割のフラット | Glassmorphism（bg-white/5 + blur） |
| 3 | **アクセントカラー** | 単色 `#7B8BDB` | `#3b82f6` → `#8b5cf6` グラデーション |
| 4 | **ホバーエフェクト** | 薄い bg 変化のみ | scale + y 移動 + グラデーション発光 |
| 5 | **アイコン** | SVG インライン（矢印のみ） | Lucide React 全面採用 |

### 1-3. 影響範囲

- **全 8 つの redesign コンポーネント** で内部書き換え
- **3 パッケージ** の新規追加（`lenis`, `lucide-react`, 任意で `three`）
- **1 新規 Astro コンポーネント** 作成（`NeuralBackground.astro`）
- **既存 props インターフェース** は変更しない → `index.astro` は最小限の修正のみ

---

## 2. 現状 → v3 ギャップ表

### 2-1. デザインシステム全体

| 項目 | 現状 (v2) | 目標 (v3) | ギャップ | 対応 |
|---|---|---|---|---|
| ベース背景 | `#0A0A0B` | `#0a0a0a` | 実質同等 | 不要 |
| アクセント | `#7B8BDB` 単色 | `#3b82f6` → `#8b5cf6` グラデ | **大** | global.css 更新 |
| カード | 分割線のみ | `bg-white/5 + backdrop-blur-md` | **大** | 全セクション書き換え |
| ボーダー | `rgba(255,255,255,0.08)` | `border-white/10` | 微差 | Tailwind クラスに統一 |
| 本文色 | `rgba(255,255,255,0.72)` | `text-white/70` | 実質同等 | クラス統一 |
| レイアウト | gap-0 分割 | Bento Grid（独立カード） | **大** | セクション毎に再設計 |
| ホバー | `hover:bg-white/[0.02]` | scale+y+glow | **大** | whileHover 追加 |
| アイコン | SVG 矢印のみ | Lucide React 全面 | **大** | パッケージ導入 |
| スクロール | ネイティブ | Lenis 慣性 | **中** | パッケージ導入 |
| 背景 | パララックス blob | ニューロン canvas | **大** | 新規コンポーネント |

### 2-2. コンポーネント別ギャップサマリ

| コンポーネント | Glassmorphism | Bento Grid | Hover効果 | アイコン | 改修規模 |
|---|:---:|:---:|:---:|:---:|:---:|
| HeroV2 | — | — | △ | — | 小 |
| HeroBackgroundV2 | — | — | — | — | **差し替え** |
| AboutSection | ✗ | △ | △ | ✗ | 大 |
| UseCasesSection | ✗ | ✗ | △ | ✗ | 大 |
| ServicesPricingSection | ✗ | ✗ | △ | ✗ | 大 |
| FAQSection | ✗ | — | — | ✗ | 中 |
| DownloadSection | ✗ | △ | ✗ | ✗ | 中 |
| FinalCTASection | ✗ | △ | △ | ✗ | 中 |

凡例: `—` 該当なし / `✗` 未実装 / `△` 部分的

---

## 3. 新規追加が必要なパッケージ

| パッケージ | バージョン目安 | 用途 | 優先度 |
|---|---|---|---|
| `lucide-react` | ^0.400 以上 | アイコン全面（strokeWidth 1.5） | **高** |
| `lenis` | ^1.1 以上 | 慣性スムーススクロール | **中** |
| `three`（任意） | ^0.160 以上 | ニューロン canvas が高度化する場合のみ | 低 |

> **Three.js について:** 2D ニューロンネットワーク（点 + 線 + パーティクル）であれば **Canvas 2D Context で十分**（軽量・60fps 維持容易）。Three.js は WebGL ベースで 3D 向きのため、まず Canvas 2D で実装 → 将来的に 3D 化する場合に Three.js を検討する。**初期実装では Three.js は不要**。

### インストールコマンド（一括）

```bash
npm install lucide-react lenis
```

---

## 4. セクション別改修計画

### 4-0. 共通先行タスク（Phase 0）

| # | タスク | 所要 | 優先 |
|---|---|---|---|
| 0-1 | `src/styles/global.css` の `@theme` にグラデーション色 `--color-v2-accent-a: #3b82f6` / `--color-v2-accent-b: #8b5cf6` を追加 | 小 | 高 |
| 0-2 | 共通 `<GlassCard>` React コンポーネント作成（`bg-white/5 + backdrop-blur-md + border-white/10 + rounded-2xl`） | 小 | 高 |
| 0-3 | 共通 `<GradientBorder>` 実装（ホバー時 conic-gradient で境界が光るラッパー） | 中 | 中 |
| 0-4 | Lucide React インストール + アイコン選定マッピング作成 | 小 | 高 |
| 0-5 | Lenis インストール + BaseLayout に組み込み（useEffect 経由） | 小 | 中 |

**チェックリスト:**
- [x] 0-1 グラデーション色トークン追加 `global.css` ✅ 2026-04-22
- [x] 0-2 GlassCard コンポーネント作成 `src/components/redesign/GlassCard.tsx` ✅ 2026-04-22
- [x] 0-3 GradientBorder コンポーネント作成 `src/components/redesign/GradientBorder.tsx` ✅ 2026-04-22
- [x] 0-4 lucide-react 導入（^1.8.0）✅ 2026-04-22
- [x] 0-5 Lenis 導入（^1.3.23）+ BaseLayout 組み込み ✅ 2026-04-22
- [x] 0-6 `npm run build` 成功確認 ✅ 2026-04-22

---

### 4-1. HeroSection（HeroV2 + HeroBackgroundV2）

**優先度: 最高**（ファーストビューのインパクトが最大）

**現状:**
- テキストベースの見出し + CTA
- 背景はパララックスで動く blob 2 つ + grid テクスチャ
- staggered 登場アニメあり

**改修内容:**
1. `HeroBackgroundV2.tsx` を **削除または無効化**
2. 新規 `NeuralBackground.astro` を裏に配置（詳細: §6）
3. `HeroV2.tsx` のテキスト照射演出追加（ニューロン光通過時にフェードイン）
4. CTA ボタンをグラデーション境界（`border-[#3b82f6] → border-[#8b5cf6]`）の発光ホバーに強化

**依存関係:** §6（ニューロン実装）を先行

**チェックリスト:**
- [x] 4-1-a NeuralBackground.astro を index.astro に配置 ✅ 2026-04-22（Phase 1）
- [x] 4-1-b HeroBackgroundV2 を無効化（Hero セクション背景を transparent に変更） ✅ 2026-04-22（Phase 1）
- [ ] 4-1-c HeroV2 の CTA ホバーにグラデーション発光
- [ ] 4-1-d テキスト照射演出（IntersectionObserver + scrollProgress）

### Phase 1 実装サマリ（2026-04-22 完了）

- `src/scripts/neural-animation.ts` — Canvas 2D ベースのニューロン伝達アニメ本体（約 400 行）
  - ノード管理、スパーク生成、スクロール連動密度、カーソル引力、DPR 上限 2、IntersectionObserver/visibilitychange による一時停止、prefers-reduced-motion 対応
- `src/components/NeuralBackground.astro` — canvas ラッパー（z-index: -1, pointer-events: none, fade-in）
- `src/pages/index.astro` — `HeroBackgroundV2` を外して `NeuralBackground` を body 先頭に配置。Hero セクションの背景を `transparent` に変更し canvas を透過表示
- `src/layouts/BaseLayout.astro` — body を inline style の `--color-v2-bg` 基調に変更。JSX コメント `{/* */}` と body タグが競合する不具合を HTML コメント `<!-- -->` で修正
- ビルド検証: `npm run build` 成功、`dist/index.html` に `background: var(--color-v2-bg)` が出力されることを確認
- スクリーンショット: `screenshots/home_v3_phase1_fixed_*.png` にて PC/タブレット/SP ダーク基調で撮影成功

### Phase 1-B 実装サマリ（2026-04-22 — 3D 化 + 全ページ貫通）

**背景:** Phase 1 の 2D 実装は「星のように見える」「Hero にしか見えない」というフィードバック。本物の神経回路感と、フッターまで続く連続体験を実現するため 3D に移行。

**実装内容:**
- `npm install three @types/three` — Three.js 導入
- `src/scripts/neural-animation.ts` を `neural-animation.ts_bak_2d` に退避
- `src/scripts/neural-animation-3d.ts` 新規作成（約 440 行）
  - `THREE.Scene` + `PerspectiveCamera` + `WebGLRenderer` の 3D 構成
  - `SphereGeometry` のノード（100 個 / モバイル 50 個）を立方体空間にランダム配置
  - `THREE.Line` で接続エッジ（半径 180px 以内、モバイル 140px）
  - 発火パルス: `SphereGeometry` を軸索上で線形補間、色を `#3b82f6 → #8b5cf6` で補間
  - **カスケード発火**: パルス到達時 55% 確率で接続先へ連鎖（最大深度 3）
  - カメラ視差（マウス連動）+ スクロールで奥へ潜る
  - **Bloom（UnrealBloomPass）**: PC かつ non-reduced-motion 時のみ（strength 0.9 / radius 0.5）
  - DPR 上限 PC 2 / モバイル 1.5
  - `prefers-reduced-motion` で静止フォールバック
- `src/components/NeuralBackground.astro` — `startNeuralAnimation3D` に切替
- **6 セクション + Footer の不透明背景を `transparent` 化**:
  - `AboutSection.tsx` / `UseCasesSection.tsx` / `ServicesPricingSection.tsx` / `FAQSection.tsx` / `DownloadSection.tsx` / `FinalCTASection.tsx`
  - `Footer.astro` の `bg-dark-bg` を外して透過
- `scripts/screenshot.cjs` に `emulateMediaFeatures` で reduced-motion 無効化（Puppeteer ヘッドレスのデフォルトが reduce のため）

**検証結果:**
- `npm run build` 成功（Three.js 込みで +500KB 警告あるが許容）
- `hero_viewport_debug.png` でニューロン 3D ネットワークが鮮明に描画されることを確認
- `sections_*.png` で About/UseCases/Services/FAQ/Download/Footer 全セクションで背景に canvas が透けて見えることを確認
- パルス（紫の発火）も正常に走る

**既知の制約（実害なし）:**
- Puppeteer の `fullPage: true` スクショは fixed 背景を Hero 位置にしか描画しない（ブラウザ仕様）。実ブラウザでの閲覧時は全セクションで canvas が見える
- `THREE.Clock` deprecation 警告（動作に影響なし）

**ファイル:**
- 新規: `src/scripts/neural-animation-3d.ts` / `scripts/screenshot-debug.cjs` / `scripts/screenshot-sections.cjs`
- 退避: `src/scripts/neural-animation.ts_bak_2d`
- 編集: `src/components/NeuralBackground.astro` / `src/components/Footer.astro` / 6 セクション TSX / `scripts/screenshot.cjs`

### Phase 1-C 実装サマリ（2026-04-22 — リッチ 3D 化）

**背景:** Phase 1-B の 3D 実装は単色球＋直線で「神経回路感」が弱い、というフィードバック。本物の神経細胞顕微鏡写真のリファレンス画像に近づけるため、発光表現・樹状突起・曲線軸索・星屑を追加。

**主な改善:**
- **発光ノード** — 白コア mesh + 青紫 radial-gradient の `Sprite` グロー（`CanvasTexture` 動的生成）。サイズはノードの奥行き Z に応じて 0.6x〜2.5x で可変 → 被写界深度感
- **樹状突起（dendrites）** — PC のみ各ノードから 5 本の `CatmullRomCurve3` ラインが放射状に伸びる（短め・低 opacity）
- **軸索の曲線化** — 直線 `Line` → `CatmullRomCurve3.getPoints(8)` の曲線。中間点をランダムにずらして有機的うねり
- **星屑背景** — `THREE.Points` で PC 1000 / モバイル 400 個。`AdditiveBlending` + `CanvasTexture` の円形減衰。8% はオレンジ色
- **オレンジパルス** — 30% の確率でオレンジ `#ff8c42` パルスを発生（青紫との対比でアクセント）
- **Bloom 強化** — strength 0.9 → 1.3, radius 0.5 → 0.6, threshold 0.0 維持
- **Fog 調整** — 奥深くほど `#05060e` にフェード（深い宇宙感）
- **パルスの挙動** — 直線補間 → エッジ曲線上を辿る形に変更。進行度に応じて scale が sin 波で膨らむ

**設定ファイル（`CONFIG`）:**
```
NODE_COUNT: PC 80 / Mobile 40
DENDRITE_PER_NODE: PC 5 / Mobile 0
STAR_COUNT: PC 1000 / Mobile 400
CONNECT_RADIUS: PC 175 / Mobile 140
ORANGE_PULSE_CHANCE: 0.3
BLOOM_STRENGTH: 1.3
```

**検証結果（Puppeteer スクショ）:**
- `sections_01_hero.png` — Hero 全面に青白いニューロン群が発光、参考画像に近い質感
- `sections_02_about.png` 〜 `sections_07_finalcta_footer.png` — 全セクションで canvas が透け、ノード・軸索・パルスが継続
- ビルド `npm run build` 成功、console エラーなし

**既知の挙動:**
- Puppeteer ヘッドレス（ソフトウェア WebGL）では Bloom がやや強く出がち。実ブラウザのハードウェアレンダリングでは繊細な発光になる想定
- 樹状突起はノードがドリフトしても追従しない（静的配置）— 負荷削減のための割り切り。視覚的違和感は少ない

**ファイル:**
- 編集: `src/scripts/neural-animation-3d.ts`（全面書き直し、約 600 行）
- 退避: `src/scripts/neural-animation-3d.ts_bak_v1`

---

### 4-2. AboutSection

**優先度: 高**

**現状:**
- Mission（3 要素）+ Why ANOM（4 理由）の 2 部構成
- gap-0 + border 分割のフラットグリッド
- `hover:bg-white/[0.02]` の弱いホバー

**改修内容:**
1. Mission 3 要素を **3 枚の Glass カード** に変換（`GlassCard` ラップ）
2. Why ANOM 4 理由を **Bento Grid（2x2）** で独立カード化
3. 各カードに Lucide アイコン追加（例: Target, TrendingDown, Users, MapPin）
4. whileHover `{ scale: 1.02, y: -5 }` + グラデーション境界発光

**依存関係:** Phase 0 完了後

**チェックリスト:**
- [ ] 4-2-a `_bak` バックアップ
- [ ] 4-2-b Mission 3 カードを Glassmorphism 化
- [ ] 4-2-c Why ANOM を Bento Grid 化
- [ ] 4-2-d Lucide アイコン組み込み
- [ ] 4-2-e whileHover 強化

---

### 4-3. UseCasesSection

**優先度: 高**

**現状:**
- 想定シナリオ 4 件（業種別）の 2 列グリッド
- About と同一のフラットパターン

**改修内容:**
1. 4 カードを **Bento Grid**（大きさを不揃いに: 製造業を大きく、他 3 件を小さく等）
2. Glassmorphism 化
3. 業種別 Lucide アイコン（Factory, Building2, Stethoscope, Leaf 等）
4. ホバー強化 + `group-hover` でカード内テキストも発光

**依存関係:** Phase 0 完了後

**チェックリスト:**
- [ ] 4-3-a `_bak` バックアップ
- [ ] 4-3-b Bento Grid 再設計（サイズ不揃い）
- [ ] 4-3-c Glassmorphism 化
- [ ] 4-3-d Lucide アイコン導入
- [ ] 4-3-e ホバーエフェクト強化

---

### 4-4. ServicesPricingSection

**優先度: 高**（ビジネス価値を伝える最重要セクション）

**現状:**
- 月額顧問 + プロジェクト型の 2 カラム
- 項目はテキストのみ
- `id="services"` アンカーあり

**改修内容:**
1. 2 カラムの内部を **Bento Grid 風 2 カード**（同サイズ、独立）
2. 各サービス項目に Lucide アイコン（Compass, Wrench, Users, LifeBuoy 等）
3. 料金表示を `text-3xl font-bold` + グラデーションテキストで強調
4. カード境界に **常時** 微かなグラデーションライン（conic-gradient）
5. ホバー時に境界がより強く発光

**依存関係:** Phase 0 完了後、§4-2, 4-3 のパターンが固まってから

**チェックリスト:**
- [ ] 4-4-a `_bak` バックアップ
- [ ] 4-4-b 2 カードを Glassmorphism 化
- [ ] 4-4-c サービス項目に Lucide アイコン
- [ ] 4-4-d 料金表示を強調（グラデーションテキスト）
- [ ] 4-4-e カード境界に常時グラデーションライン
- [ ] 4-4-f `id="services"` アンカー維持確認

---

### 4-5. FAQSection

**優先度: 中**

**現状:**
- sticky 左見出し + 右アコーディオン 6 件
- AnimatePresence で height auto アニメ
- 平面的デザイン

**改修内容:**
1. アコーディオンアイテムを **Glassmorphism カード** 化（個別独立感）
2. アイコン `+` → Lucide `Plus` / `Minus` に置き換え（strokeWidth 1.5）
3. 開いた項目に微かなグラデーション左ボーダー（4px 幅）
4. sticky 見出しに `text-white/40` ラベル + グラデーションテキスト見出し

**依存関係:** Phase 0 完了後

**チェックリスト:**
- [ ] 4-5-a `_bak` バックアップ
- [ ] 4-5-b アコーディオンアイテムを Glass 化
- [ ] 4-5-c Lucide Plus/Minus アイコン
- [ ] 4-5-d 開項目のグラデーション左ボーダー
- [ ] 4-5-e sticky 見出しの装飾強化

---

### 4-6. DownloadSection

**優先度: 中**（準備中表示のまま）

**現状:**
- 3 カードで「PREPARING」バッジ表示
- `aria-disabled` でクリック無効化

**改修内容:**
1. 3 カードを Glassmorphism 化（ただし **opacity 低め** で準備中感を残す）
2. PREPARING バッジをグラデーションダッシュボーダーに変更
3. Lucide アイコン（FileText, Folder, ClipboardCheck 等）
4. 下部 CTA「無料相談する」ボタンをグラデーションホバー化

**依存関係:** Phase 0 完了後

**チェックリスト:**
- [ ] 4-6-a `_bak` バックアップ
- [ ] 4-6-b カードを Glass 化（低 opacity）
- [ ] 4-6-c PREPARING バッジ装飾改善
- [ ] 4-6-d Lucide アイコン導入
- [ ] 4-6-e CTA ボタンをグラデーション化

---

### 4-7. FinalCTASection

**優先度: 中**

**現状:**
- 2x2 インフォグリッド + 白 CTA ボタン
- フラットデザイン

**改修内容:**
1. 2x2 インフォを **Bento Glass カード** 化（LOCATION, HOURS, EMAIL, SESSION）
2. 各カードに Lucide アイコン（MapPin, Clock, Mail, MessageCircle）
3. 見出しにグラデーションテキスト適用
4. 白 CTA をグラデーション境界ホバーに強化

**依存関係:** Phase 0 完了後

**チェックリスト:**
- [ ] 4-7-a `_bak` バックアップ
- [ ] 4-7-b インフォ 4 カードを Glass 化
- [ ] 4-7-c Lucide アイコン導入
- [ ] 4-7-d 見出しグラデーション
- [ ] 4-7-e CTA ボタン強化

---

### 4-8. Header / Footer

**優先度: 低**

**現状:**
- Header: スクロール連動でテーマ変化（dark→light）
- Footer: ダークゾーンで完結

**改修内容（オプション）:**
1. Header のスクロール後 `bg-white/90` を **`bg-black/60 + backdrop-blur-lg`** に変更（v3 の暗基調と統合）
2. Footer に微かなグラデーション上部ボーダー

**チェックリスト:**
- [ ] 4-8-a Header のスクロール後背景を暗系に
- [ ] 4-8-b Footer 上部にグラデーションライン

---

## 5. 実行順序（依存グラフ）

```
[Phase 0] 共通基盤
  ├─ 色トークン追加
  ├─ GlassCard コンポーネント
  ├─ GradientBorder コンポーネント
  ├─ lucide-react 導入
  └─ Lenis 導入
        ↓
[Phase 1] ニューロンアニメーション（§6）
  └─ NeuralBackground.astro
        ↓
[Phase 2] Hero 統合
  └─ HeroV2 + NeuralBackground
        ↓
[Phase 3] コンテンツセクション（優先順）
  ├─ 3a. AboutSection
  ├─ 3b. UseCasesSection
  ├─ 3c. ServicesPricingSection
  ├─ 3d. FAQSection
  ├─ 3e. DownloadSection
  └─ 3f. FinalCTASection
        ↓
[Phase 4] 周辺（任意）
  └─ Header / Footer 装飾強化
        ↓
[Phase 5] 最終調整
  ├─ スクリーンショット確認（PC/タブレット/SP）
  ├─ パフォーマンス計測（Lighthouse）
  └─ GitHub Pages デプロイ検証
```

---

## 6. ニューロン伝達アニメーション 実装方針

### 6-1. 技術選定

**推奨: Canvas 2D Context（raw）**

| 選択肢 | 利点 | 欠点 | 結論 |
|---|---|---|---|
| **Canvas 2D（推奨）** | 軽量、依存ゼロ、60fps 維持容易 | 3D 不可 | ◎ |
| Three.js（WebGL） | 3D 対応、シェーダー可 | バンドル +150KB、Astro Island 制約 | ✗ 過剰 |
| R3F | React 統合 | Astro Islands と相性悪い（CLAUDE.md 禁止） | ✗ 禁止 |

**決定:** 初期実装は **Canvas 2D 単独**。将来 3D 化する場合に Three.js 検討。

### 6-2. ファイル構成

```
src/
├── components/
│   └── NeuralBackground.astro   ← Astro コンポーネント（<canvas> + <script>）
└── scripts/
    └── neural-animation.ts       ← アニメーションロジック（class ベース）
```

**`NeuralBackground.astro`（構造）:**
```astro
---
// Astro フロント（ビルド時のみ実行）
---
<canvas id="neural-canvas" class="fixed inset-0 z-0 pointer-events-none"></canvas>

<script>
  import { startNeuralAnimation } from "../scripts/neural-animation";
  startNeuralAnimation();
</script>
```

**重要:** `client:load` 等のディレクティブは使わない（Astro Island にしない）。純粋な `<script>` タグ経由。

### 6-3. アニメーションロジック（neural-animation.ts）

**クラス構造:**
```
NeuralAnimation
  ├─ nodes: Node[]          ← パーティクル配列
  ├─ sparks: Spark[]         ← 走る光の粒
  ├─ pointer: {x, y, active} ← カーソル座標
  ├─ scrollProgress: 0〜1    ← スクロール深度
  ├─ targetNodeCount: number ← 現在目標のノード数
  │
  ├─ init()        ← canvas サイズ、DPR、イベント登録
  ├─ resize()      ← リサイズ対応
  ├─ spawnNode()   ← ノード追加
  ├─ spawnSpark()  ← 1〜2s 間隔でスパーク生成
  ├─ update()      ← 位置更新、カーソル引力、スパーク進行
  ├─ draw()        ← 全描画（points + lines + sparks）
  └─ loop()        ← requestAnimationFrame
```

### 6-4. パフォーマンス設計

| 項目 | PC | モバイル |
|---|---|---|
| 初期ノード数 | 30〜50 | 20〜30 |
| 最大ノード数 | 150 | 75 |
| DPR 上限 | 2 | 2 |
| カーソル連動 | 有効（半径 150px） | 無効 |
| スパーク頻度 | 1〜2s / 1 回 | 2〜3s / 1 回 |
| 接続判定半径 | 180px | 140px |

**最適化施策:**
- `requestAnimationFrame` 単一ループ
- `document.hidden` / IntersectionObserver で描画一時停止
- `prefers-reduced-motion` 検出時は静止画（ノードのみ、スパーク無効）
- ライン描画は `ctx.beginPath()` → 複数 moveTo/lineTo → 1 回の `stroke()` でバッチ化
- スパーク色グラデーションは線形補間で RGBA 計算（`ctx.createLinearGradient` より軽い）

### 6-5. スクロール連動

```ts
// 概略
window.addEventListener('scroll', () => {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  this.scrollProgress = Math.min(window.scrollY / maxScroll, 1);
  this.targetNodeCount = Math.floor(
    INITIAL_NODES + (MAX_NODES - INITIAL_NODES) * this.scrollProgress
  );
}, { passive: true });
```

毎フレーム `nodes.length < targetNodeCount` であれば徐々に `spawnNode()`。

### 6-6. カーソル引力（PC のみ）

```ts
// 各ノードに対して
const dx = pointer.x - node.x;
const dy = pointer.y - node.y;
const dist = Math.hypot(dx, dy);
if (dist < ATTRACT_RADIUS) {  // 150px
  const force = (ATTRACT_RADIUS - dist) / ATTRACT_RADIUS * 0.05;
  node.vx += (dx / dist) * force;
  node.vy += (dy / dist) * force;
}
```

### 6-7. スパーク演出

- 1〜2 秒間隔でランダムに「接続している 2 ノード」を選択
- パーティクルを A→B に 400〜800ms で移動
- 色は進行度に応じて `#3b82f6` → `#8b5cf6` 線形補間
- 発光: `ctx.shadowBlur = 12; ctx.shadowColor = currentColor;`

### 6-8. Astro / GitHub Pages 対応

- `base: /anom-corporate` の影響なし（canvas 内完結のため）
- テクスチャ参照する場合は `import.meta.env.BASE_URL` で動的取得

### 6-9. パフォーマンス懸念点と対策

| 懸念 | 原因 | 対策 |
|---|---|---|
| モバイルで fps 低下 | ノード多すぎ | matchMedia でノード数半減 |
| 背後のスクロールでも描画継続 | ループ常時動作 | `document.hidden` で停止 |
| ホーム以外でも動作 | グローバル配置 | ページごとに条件分岐 or ホーム限定配置 |
| canvas サイズが巨大 | 4K で 3840x2160 | DPR 2 上限 + `Math.min(window.innerWidth, 1920)` |
| 初期描画で CLS | canvas マウント後フラッシュ | 最初の 1 フレームは空白描画 |

**推奨:** 初期導入時はホームページ限定（`/` のみ）で配置。他ページの装飾は別フェーズ。

---

## 7. リスク・懸念

| # | リスク | 影響 | 対策 |
|---|---|---|---|
| 1 | Lenis 導入でスクロールアンカー（`#services`）が効かなくなる | 中 | Lenis の `scrollTo` API を使った同期処理を実装 |
| 2 | canvas アニメで mobile fps が出ない | 中 | matchMedia でノード数削減、reduced-motion 対応 |
| 3 | GitHub Pages デプロイでアセットパスが壊れる | 高 | 画像・テクスチャは `withBase()` 経由で統一 |
| 4 | Framer Motion + Lenis の干渉 | 中 | `useInView` のオフセット調整で対応 |
| 5 | Tailwind v4 でグラデーション境界が効かない | 低 | `@theme` でカスタム定義 + CSS fallback |
| 6 | 大幅リデザインでブランド整合性が崩れる | 中 | ブランドアセット.png と定期的に照合 |

---

## 8. 成功基準

### 8-1. 技術面
- [ ] 全セクションで Glassmorphism + Bento Grid 適用
- [ ] ニューロンアニメが PC/モバイルで安定 60fps
- [ ] Lighthouse パフォーマンス **80 以上**（モバイル）
- [ ] Lighthouse アクセシビリティ **95 以上**
- [ ] GitHub Pages 本番環境で視覚崩れなし

### 8-2. デザイン面
- [ ] Aceternity / Magic UI と比較して遜色ないリッチ感
- [ ] Linear の静謐さを保った余白設計
- [ ] ANOM ミッション「無駄を削ぎ落とす」に反しない（過剰装飾なし）
- [ ] ターゲット（秋田中小企業経営者 30〜50 代）に響く信頼感・知性

### 8-3. ビジネス面
- [ ] お問い合わせ導線が各セクションから明確
- [ ] 「効果がある証拠」を伝える Use Cases が強化されている
- [ ] 料金表示が明快で判断しやすい

---

## 9. 次アクション

このプランの承認後、**Phase 0（共通基盤）から着手**します。

**Phase 0 の最初のコミット:**
1. `global.css` に v3 色トークン追加
2. `npm install lucide-react lenis`
3. `src/components/redesign/GlassCard.tsx` 新規作成
4. `src/components/redesign/GradientBorder.tsx` 新規作成
5. Lenis を BaseLayout に組み込み

ユーザー承認が出るまでコード変更は行わない。

---

_このファイルは v3 改修の進行管理マスターファイルとして、各 Phase 完了ごとにチェックリストを更新する_
