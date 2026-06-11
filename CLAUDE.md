# ANOM コーポレートサイト — プロジェクト CLAUDE.md

> このファイルは **anom-corporate リポジトリの技術司令塔**。
> ブランド・事業方針は `../../CLAUDE.md`（claude 秘書）と `~/.claude/CLAUDE.md`（グローバル）を参照。
>
> **2026-06-11 に全面刷新**: 旧Astro版（v1〜v3）は `archive/astro-v3` ブランチに完全保存。
> 現行は **ビルド不要の静的サイト**（HTML/CSS/JS直書き、npm不要）。

---

## 0. 絶対ルール

1. **ビルド工程を持ち込まない** — npm/バンドラ不要のまま保つ。テキスト修正→push だけで公開が完結する状態を守る
2. **コメントは日本語** — 保守する人（非エンジニア含む）が読める状態を維持
3. **ライブラリは `assets/vendor/` の同梱版を使う** — CDN直リンクに戻さない（供給網リスク・障害対策）。更新時はバージョンを明記してファイル差し替え
4. **CSPを壊さない** — 外部サービス追加時は index.html のCSPメタに追記。inlineスクリプト/styleは書かない（CSPで遮断される）
5. **ブランドアセット準拠** — `../ブランドアセット/` の色・ロゴ使用ルールに従う
6. **シークレットをコミットしない** — Web3Formsのアクセスキーは公開可能設計のため例外（ドメイン制限を併用）
7. **実装後はプレビューで確認** — `preview_start: anom-site`（port 4500）でPC/モバイル両方を目視

## 1. リポジトリ概要

- **GitHub:** https://github.com/tapiAI-coder/anom-corporate
- **公開:** GitHub Pages（main ブランチ / ルート配信）※2026-06-11時点では未公開（QA後に再有効化）
- **本番URL:** ★独自ドメイン接続後にここへ記載（暫定: https://tapiai-coder.github.io/anom-corporate/）
- **ブランチ:** `main`=本番 ／ `archive/astro-v3`=旧Astro版アーカイブ（触らない・消さない）

## 2. ファイル構成と編集の早見表

```
anom-corporate/
├── index.html          ← 本編1ページ（文言修正はここ）
├── privacy.html        ← プライバシーポリシー
├── 404.html            ← Not Foundページ
├── robots.txt          ← ★URL変更時に更新
├── sitemap.xml         ← ★URL変更時に更新
├── assets/
│   ├── css/style.css   ← 全スタイル（冒頭に目次コメントあり）
│   ├── js/
│   │   ├── config.js   ← 運用設定（Web3Formsキー・メールアドレス）★運用で触るのは原則ここだけ
│   │   ├── main.js     ← 起動・ナビ・スクロール制御
│   │   ├── particles.js← WebGL粒子（ヒーロー演出）
│   │   ├── animations.js← GSAPスクロール演出・カーソル演出
│   │   └── form.js     ← フォーム送信処理
│   ├── vendor/         ← 同梱ライブラリ（Three.js r128 / GSAP 3.12.5 / ScrollTrigger 3.12.5 / Lenis 1.1.14）
│   └── img/            ← favicon / apple-touch-icon / ogp
└── docs/               ← 本番化計画.md / 運用マニュアル.md
```

**★URL を含むファイル**（ドメイン変更時に一括更新）: index.html（canonical / og:url / og:image / JSON-LD）、robots.txt、sitemap.xml

## 3. デザインシステム（v4・現行）

| トークン | 値 | 用途 |
|---|---|---|
| `--ink` | `#16243E` | 基本文字色（濃紺） |
| `--warm` | `#F7F6F1` | 交互セクション背景（温白） |
| `--muted` | `#5A6275` | 弱い文字 |
| `--accent` | `#4D5DFF` | 差し色（エレクトリックブルー） |
| `--dark` | `#0B1322` | ヒーロー/CTA背景（深紺） |

- 構成: ダークヒーロー → 白/温白の交互シート → アクセント帯 → ダークCTA
- フォント: Inter（英字）+ Noto Sans JP（日本語）、Google Fonts
- 旧v3（純黒+Glassmorphism+青紫グラデ）は廃止。`CLAUDE.md` 旧版はarchiveブランチ参照

## 4. 演出アーキテクチャ

- **粒子（particles.js）**: 混沌→秩序で「ANOM」形成。環境適応（モバイル粒子減・WebGL不可で静的フォールバック・reduced-motionで静止画・タブ非表示/ヒーロー外で描画停止）
- **スクロール（animations.js）**: Lenis慣性 + GSAP ScrollTrigger。ヒーローpinのトンネル演出は1回だけ
- **HTML側のクラスが演出の合図**: `.reveal` `.reveal-group` `.split` `.magnetic` `.tilt`（詳細はanimations.js冒頭コメント）
- セクション追加時はこれらのクラスを付けるだけで演出が適用される

## 5. お問い合わせフォーム

- Web3Forms（無料・サーバーレス）。キーは `assets/js/config.js` の `FORM_ACCESS_KEY`
- キー未設定時は送信せずメール案内を表示（安全動作）
- スパム対策: ハニーポット（botcheck）+ Web3Forms側フィルタ。**Web3Forms管理画面でドメイン制限を設定すること**
- 送信テスト手順は `docs/運用マニュアル.md`

## 6. 開発ワークフロー

```
プレビュー起動: preview_start「anom-site」（npx serve, port 4500）
確認:           PC / モバイル両方のスクリーンショット + コンソールエラーゼロ
公開:           git add → commit → push（GitHub Pagesが自動反映、数分）
戻す:           git revert（直前の公開を取り消し）
```

**既知の注意**: CSPメタはプレビューパネルのスクリーンショット機構と干渉する（撮影タイムアウト）。
撮影検証が必要な時だけCSP行を一時コメントアウトし、**検証後に必ず戻す**。
また、プレビューのモバイルエミュレーションはWebGLレイヤーを等倍合成するため粒子が大きく/見切れて写ることがある（実機では正常。DOM座標プローブで検証済み）。

## 7. セキュリティ設計（変更時に維持すること）

- CSPメタ: `script-src 'self'`（インラインJS禁止）・接続先は fonts / web3forms のみ許可
- vendor同梱 + バージョン固定（CDN改ざん・障害の影響を受けない）
- referrer-policy: strict-origin-when-cross-origin
- 外部リンクは `rel="noopener"`（target=_blank時）
- `.env` はgitignore済み（現状シークレットなし）

## 8. 公開・ドメイン

- GitHub Pages: Settings → Pages → Deploy from branch → main / (root)
- 独自ドメイン接続時: ①Pagesにカスタムドメイン設定 ②DNSにCNAME/Aレコード ③★URLファイル一括更新 ④HTTPS強制ON
- 旧Astro版のPages設定はGitHub Actions経由だったが、現行はブランチ配信（Actionsワークフローなし）
