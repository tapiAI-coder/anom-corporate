# ANOMコーポレートサイト 再デザイン 引継ぎ

**作成日**: 2026-04-20
**目的**: 新しいセッションでデザイン全体を一から作り直すための引継ぎ資料
**前提**: 現在の実装は**残す**（削除・上書きしない）

---

## 1. プロジェクト基本情報

- **パス**: `C:\Users\tapi2\OneDrive\Desktop\claude 秘書\事業計画\anom-corporate`
- **スタック**: Astro 6.x / Tailwind CSS v4（`@theme` ブロック方式、configなし）/ TypeScript
- **デプロイ**: GitHub Pages（サブパス `/anom-corporate/` / `base` 設定済）
- **開発サーバー**: `npm run dev -- --port 4323` → http://localhost:4323/anom-corporate/
- **launch.json（preview_start用）**: `C:/Users/tapi2/.claude/.claude/launch.json` にPowerShell経由の設定あり

## 2. 事業・ブランド文脈（必読）

- **運営**: ANOM（秋田拠点のAI×DXコンサル、1人会社）
- **ターゲット**: 秋田の中小企業
- **ミッション**: 無駄の削減 → 適材適所 → 売上向上 / 秋田と関東の差をなくす
- **ブランド課題**: 実績がまだ少ない → **信頼感・高級感で補う**
- **NG**:
  - 人の顔写真（特にストックの日本人ビジネスパーソン系）
  - SaaS製品の固有名（desknet's NEOなど）
  - 「AIっぽいスタートアップ風」の派手さ

## 3. デザインの方向性（ユーザー指定）

- **リファレンス**: Linear.app / Apple.com レベル
- **キーワード**: 最高峰のデザインとアニメーション、高級感、信頼感、Modern Business
- **現状との違い**: 現在もLinear風を目指したが、**より研ぎ澄ます / アニメーション品質を引き上げる**

## 4. 現状ファイル構成スナップショット

```
src/
├─ pages/
│  ├─ index.astro         # トップ（Hero / Mission / Capabilities / Services / CTA）
│  ├─ services.astro      # サービス詳細
│  ├─ pricing.astro       # 料金
│  ├─ about.astro         # 代表紹介
│  ├─ company.astro       # 会社情報
│  ├─ contact.astro       # お問い合わせ
│  └─ thanks.astro        # 送信完了
├─ components/
│  ├─ Hero.astro
│  ├─ ServiceCard.astro
│  ├─ CapabilitySlider.astro   # 新規（8領域の横スクロール）
│  ├─ CTASection.astro
│  ├─ ContactForm.astro
│  ├─ Header.astro / Footer.astro
│  ├─ LineButton.astro
│  ├─ SEOHead.astro
│  └─ ui/
├─ data/
│  ├─ capabilities.ts     # 8領域定義（新規）
│  ├─ services.ts
│  ├─ pricing.ts
│  ├─ company.ts
│  └─ navigation.ts
├─ layouts/
│  └─ BaseLayout.astro
└─ styles/
   └─ global.css          # @theme + glass-card / glow-hover
```

### 現在のデザイントークン（global.css）

| 変数 | 値 |
|---|---|
| --color-dark-bg | #0d1117 |
| --color-accent | #6366f1 |
| --color-accent-light | #a5b4fc |
| --color-accent-on-light | #4f46e5 |
| --color-glow | rgba(99,102,241,0.10) |
| --color-glass-bg | rgba(255,255,255,0.03) |
| --color-glass-border | rgba(255,255,255,0.06) |

### git状態（未コミット）

以下が変更・未追跡の状態で残っている：

- M: CLAUDE.md, global.css, Hero/ServiceCard/CTASection/ContactForm/Footer/Header/LineButton.astro, BaseLayout.astro, 各pages
- ??: `.claude/`, `public/textures/`, `CapabilitySlider.astro`, `capabilities.ts`, `HANDOFF_REDESIGN.md`(このファイル)

**ブランチ**: main / 直近コミット: `e8e7146 代表紹介ページ追加（Phase 2-3）`

→ 新セッションでは、これらを**残したまま別ブランチで再設計**するのが安全。

## 5. 新セッション開始時の推奨手順

1. **この HANDOFF_REDESIGN.md を読む**
2. 現在の実装を保存するため、以下のどちらかを先に実行：
   - **案A（推奨）**: `git add -A && git commit -m "WIP: Linear風デザイン第1弾（アーカイブ）"` → 新ブランチ `redesign-v2` を切る
   - **案B**: `src/` 全体を `99_アーカイブ/v1_linear/` にコピー保管
3. Linear / Appleサイトを改めて調査（参考ポイントを言語化）
4. /plan モードで再設計プランを立案（ユーザー承認まで実装しない）
5. プラン承認後、Phase分けで実装

## 6. 再設計時に意識したいポイント（前回からの学び）

- **アニメーションの質**: 今回はhover glowのみ。View Transitions / scroll-triggered reveal / 細やかな easing の作り込みが不足
- **タイポグラフィ**: 見出しのウェイト・トラッキング・階層をもっと攻めても良い
- **余白**: まだセクション間が「均等」すぎる。緩急が欲しい
- **カラー**: インディゴ系で無難にまとまっている。もう一段ブランドを感じる色を検討（Apple的な深いブラック＋アクセント控えめ など）
- **画像戦略**: 現状ほぼアイコンのみ。抽象CG / プロダクトUIモック / 3Dレンダ など選択肢を整理する
- **信頼感の演出**: 数値・ロジック・プロセスの見せ方（例: "8カテゴリ" の表示を更に構造化）

## 7. 参考: 前回のデザインプラン（スナップショット）

`C:\Users\tapi2\.claude\plans\swift-discovering-shore.md` に前回の5 Phase プランが残っている。再設計時の「やらないこと」リファレンスとして参考に。

## 8. セッション記録

前回セッション要約: `claude 秘書/案件/セッション記録/2026-04-20_01.md`
