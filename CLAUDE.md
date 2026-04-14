# ANOM コーポレートサイト — 開発ルール

## 絶対ルール（全実装で必ず守る）

1. **Tailwind CSS を使用する** — スタイリングは全て Tailwind CSS のユーティリティクラスで行う。独自CSSは最小限に留める
2. **レスポンシブ対応（スマホ・PC）を必須とする** — モバイルファーストで設計し、全ページ・全コンポーネントで `sm:` `md:` `lg:` のブレークポイントを適切に使う
3. **コメントは日本語で入れる** — コード内のコメントは全て日本語で記述する
4. **ブランドアセットに準拠する** — `事業計画/ブランドアセット/` フォルダの情報を必ず参照し、色・フォント・ロゴ使用ルールに沿ったデザインにする。自己判断で色やフォントを変えない
5. **既存UIコンポーネントを積極的に使う** — shadcn/ui 等の既製コンポーネントを活用し、ゼロからの自作（車輪の再発明）はしない。ボタン、カード、フォーム、ナビゲーション等はまず既存ライブラリから選ぶ
6. **コードを書いたらローカルサーバーを起動する** — 実装後は必ず `npm run dev` でローカルサーバーを起動し、実際の表示を確認する
7. **スクリーンショットでPC・タブレットの見え方を確認する** — Puppeteer（`node scripts/screenshot.cjs [URL] [ページ名]`）でPC（1280px）・タブレット（768px）・スマホ（375px）のスクリーンショットを撮り、表示を目視確認する
8. **余白やレイアウトの問題があれば修正→再スクリーンショット** — スクリーンショットで余白崩れ・はみ出し・文字切れ等を発見したら修正し、再度スクリーンショットを撮って問題が解消されたことを確認してから次に進む

## 技術スタック

- フレームワーク: Astro 6.x（React統合あり — @astrojs/react）
- UIコンポーネント: shadcn/ui（React版。Astro の Islands Architecture で使用）
- スタイリング: Tailwind CSS v4（@tailwindcss/vite でViteプラグイン方式。@astrojs/tailwind は不使用）
- 言語: TypeScript（strict モード）
- ホスティング: Cloudflare Pages
- フォーム: Web3Forms
- フォント: Inter + Noto Sans JP（Google Fonts）
- ビュー確認: Puppeteer（scripts/screenshot.cjs）

### 技術的な決定事項（実装中に確定したもの）

- Tailwind CSS v4 は `@tailwindcss/vite` で統合（`@astrojs/tailwind` はv4非対応のため不使用）
- テーマ定義は `src/styles/global.css` 内の `@theme` ブロックで行う（tailwind.config.mjs は不要）
- `@import url(...)` はCSS最上部に配置（Tailwind @importより前）
- パスエイリアス `@/*` → `./src/*` を tsconfig.json で設定済み

## UIコンポーネント方針

- **shadcn/ui を優先的に使用する** — Button, Card, Input, Select, Textarea, Dialog, Sheet（モバイルメニュー）, Badge, Separator 等
- shadcn/ui で対応できない場合のみ Astro コンポーネントで自作する
- shadcn/ui コンポーネントは `src/components/ui/` に配置（shadcn CLI のデフォルト）
- Astro ページ内で React コンポーネントを使う場合は `client:load` または `client:visible` ディレクティブを付ける
- インタラクション不要な静的部分は Astro コンポーネントのままにし、JS を最小限に保つ

## ブランドアセット

**参照元:** `事業計画/ブランドアセット/`

### ロゴファイル

| ファイル | 用途 |
|---|---|
| `ブランドアセット/ロゴデータ/ANOM メインロゴ.png` | メインロゴ（シンボル + テキスト + タグライン） |
| `ブランドアセット/ロゴデータ/シンボルマーク単体 SNSアイコン、ファビコン用.png` | ファビコン、OGP、SNSアイコン |
| `ブランドアセット/ブランドアセット.png` | ロゴバリエーション一覧（カラー・背景の組み合わせ） |

### ロゴ使用ルール（ブランドアセット.png に基づく）

- **白背景:** ダークネイビー + ブラックのメインロゴを使用
- **ネイビー背景（フッター等）:** 白抜きロゴを使用
- **シンボルマーク単体:** ファビコン、SNSアイコン、小スペースで使用
- ロゴの色を変えない。使って良い組み合わせはブランドアセット.png に記載のもののみ

### カラーパレット（tailwind.config.mjs で定義）

| トークン | HEX | 用途 | 根拠 |
|---|---|---|---|
| `navy` | `#1B2A4A` | 見出し、ボタン、ヘッダー | ロゴ左側のダークネイビー |
| `navy-light` | `#3B5998` | ホバー、リンク | navyの明るい派生色 |
| `navy-dark` | `#0F1A2E` | 濃いアクセント | navyの暗い派生色 |
| `dark` | `#111111` | テキスト、アクセント | ロゴ右側のブラック |

**注意:** 上記以外の有彩色を追加しない。ブランドの世界観（ネイビー + ブラック + ホワイトの無彩色ベース）を崩さない

### フォント

| 用途 | フォント | 理由 |
|---|---|---|
| 英字（見出し・ロゴ周り） | Inter | ロゴの幾何学的サンセリフに近い |
| 日本語（本文） | Noto Sans JP | Interとの相性が良く可読性が高い |
| タグライン | letter-spacing広め + font-weight細め | ロゴの「AUTONOMOUS + MINIMALISM」の表現に準拠 |

## コーディング規約

- コンポーネントは `src/components/` に `.astro` ファイルとして作成
- ページは `src/pages/` に配置（Astro のファイルベースルーティング）
- コンテンツデータは `src/data/` に TypeScript ファイルとして分離
- 画像は `public/images/` に配置し、Astro の `<Image>` コンポーネントで最適化

## スクリーンショット確認フロー

実装後の確認は以下の手順で行う:

1. `npm run dev` でローカルサーバーを起動
2. `node scripts/screenshot.cjs http://localhost:4321 top` でスクリーンショット撮影
3. `screenshots/` フォルダに出力された画像を確認（PC / タブレット / スマホの3サイズ）
4. 問題があれば修正し、再度撮影して確認

```bash
# 使い方
node scripts/screenshot.cjs [URL] [ページ名]

# 例
node scripts/screenshot.cjs http://localhost:4321 top
node scripts/screenshot.cjs http://localhost:4321/contact contact
node scripts/screenshot.cjs http://localhost:4321/company company
```

出力ファイル:
- `screenshots/{ページ名}_pc.png` — 1280x800
- `screenshots/{ページ名}_tablet.png` — 768x1024
- `screenshots/{ページ名}_sp.png` — 375x667

## 参照ドキュメント

- 実装計画: `事業計画/plan.md`
- ブランドアセット: `事業計画/ブランドアセット/`
- ブランドアセット一覧: `事業計画/ブランドアセット/ブランドアセット.png`
- メインロゴ: `事業計画/ブランドアセット/ロゴデータ/ANOM メインロゴ.png`
- シンボルマーク: `事業計画/ブランドアセット/ロゴデータ/シンボルマーク単体 SNSアイコン、ファビコン用.png`
