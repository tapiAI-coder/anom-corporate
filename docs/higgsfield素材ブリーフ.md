# higgsfield 素材ブリーフ（コーポレートサイト ビジュアル強化）

> 目的: ANOMサイトに「シネマティックな静止画」を要所だけ足し、ミニマルさを保ったまま質感と第一印象を底上げする。
> 方針（合意済み）: 派手な全画面動画は入れない。ヒーローの粒子アニメ（混沌→秩序で"ANOM"形成）は**触らない**。静止画を要所に1〜2枚だけ。
> ステータス: プロンプト確定済み。生成は保留（ユーザーが任意のタイミングで実施）。

---

## 0. 重要な前提（つまずきポイント）

- **higgsfield フリープランは MCP 経由の生成ができない**（"Requires basic plan or higher"）。料金ではなくプラン制限。
- 生成するには次のどちらか:
  1. higgsfield.ai の**サイト側**で自分で生成（無料枠があれば）→ ダウンロード
  2. **有料プラン（basic以上）**に上げて、Claude（MCP）からこの場で生成
- 1枚あたりのクレジットは激安（Soul Location で約0.12クレジット）。ボトルネックは「枚数」ではなく「プラン」。

## 1. フェーズA（低リスク・最優先）で作る素材は2つ

| 記号 | 用途 | 置き場所 | 効果 |
|---|---|---|---|
| **A. OGP画像** | SNS共有時のカバー画像 | index.html の `og:image` / `twitter:image` が指すファイルを差し替え | URLを送った瞬間の第一印象が激変。サイト表示は重くしない |
| **B. ヒーロー背景テクスチャ** | 粒子アニメの背後の「地」 | style.css の `.hero` 背景（真っ黒#121419を質感ある暗色に） | 粒子はそのまま、奥行きと上質さが増す |

**1枚の世界観で A と B の両方を兼ねられる**（無駄なく1素材2役）。まずどちらかの方向を1枚選べばよい。

## 2. 確定プロンプト（Soul Location 推奨 / 16:9）

共通仕様: **16:9 ／ 暗め・ローキー ／ 文字・ロゴ・人物なし ／ 余白多め ／ フィルムグレイン**。

### 方向1：純・抽象（推奨・低リスク）
混沌→秩序を「一筋の青い光に収束する無数の点」で表現。普遍的で外しにくい。

```
Cinematic ultra-minimal abstract scene on a deep near-black background (#121419).
Countless tiny scattered points of light, faint and chaotic on the left side,
gradually converging into one clean ordered stream of cool blue light (#4D5DFF)
toward the right. Vast negative space, deep shadows dominate, low-key lighting,
subtle volumetric haze, fine film grain, premium editorial mood, high-end tech
minimalism. No text, no logo, no people. Calm, intelligent, quietly powerful.
```

### 方向2：秋田×デジタル
ブルーアワーの稜線に一本のデータの光。「秋田と関東の差をなくす」ミッションを映像化。やや個性的だが literal になりやすいので注意。

```
Cinematic ultra-minimal landscape on a deep near-black background. A vast quiet
snow field and low mountain horizon at blue hour, mostly dark, low-key, deep
shadows dominate, faint cool mist. A single delicate thread of glowing blue light
(#4D5DFF) like data quietly flowing across the horizon, order emerging from a
calm dark void. Vast negative space, fine film grain, premium editorial mood,
serene and intelligent. No text, no logo, no people. 16:9 cinematic still.
```

### 微調整フレーズ（出力を直したいとき）
- 明るすぎる → `even darker, mostly black, minimal light, lower exposure`
- ごちゃつく → `more negative space, simpler composition, fewer elements`
- 青が強すぎ → `very subtle blue accent, almost monochrome`

## 3. 採用基準（生成した中からどれを選ぶか）

- 全体が**しっかり暗い**こと（上に白い文字＝ナビ・"ANOM"粒子が乗るため）。
- **画面の上〜中央が特に暗く・空いている**こと（粒子テキストの可読性）。明るい部分は端か下に寄っているのが良い。
- 文字状の模様・人影が**紛れ込んでいない**こと。
- 青はネオンではなく**上品な差し色**程度。
- 生成は `count` 3〜4枚で出して一番上記に合うものを選ぶ。

## 4. 仕上げ仕様（生成後、こちらで統合する際の目標値）

### A. OGP
- 最終 **1200×630px**（1.91:1）。16:9で生成 → 中央を1.91:1にトリミング。
- 形式 **JPGまたはPNG**（webpは一部SNS/LINEのOGPで表示されないため避ける）。目標 **500KB以下**。
- 文字は焼き込まない（必要ならロゴ/タグラインは後から重ねる）。

### B. ヒーロー背景
- 形式 **webp**（サイト内なので軽さ優先）。目標 **250KB以下**、目安 1920×1080。
- CSSで `.hero` の背景に敷き、粒子キャンバスは**その上**（z-index）。`#121419`ベース＋暗いグラデーション重ねでコントラスト保証。
- 必要なら opacity 0.5〜0.7 で薄く敷く。

## 5. サイトで自分で生成する手順（無料枠を使う場合）

1. higgsfield.ai にログイン
2. Image生成（Soul 系／Soul Location）を選択
3. 上のプロンプトを貼り付け、aspect ratio を **16:9** に
4. 生成 → 採用基準に合う1枚を**最高解像度でダウンロード**
5. ファイルを案件フォルダに置く or Claudeに渡す → 圧縮・トリミング・配置・プレビュー検証はこちらで実施

## 6. 統合時のこちら側チェックリスト（画像が用意できたら）

- [ ] index.html の `og:image`/`twitter:image` の実ファイル名を確認して差し替え
- [ ] OGPは1200×630にトリミング・JPG圧縮（500KB以下）
- [ ] ヒーロー背景はwebp圧縮（250KB以下）、`.hero`にCSSで敷く
- [ ] 粒子アニメが背景の上で従来どおり動くか確認（**アニメ本体は変更しない**）
- [ ] CSP: 画像は自己ホストなので connect 変更不要。`img-src 'self'` の範囲内
- [ ] プレビューでPC/モバイル確認（CSP一時コメントアウト→**検証後必ず戻す**）

---

次フェーズ（任意・後回し）: C. コンセプト帯（セクション転換に静止画1枚）／ D. ブランドフィルム（SNS・商談用の15〜30秒、サイトは任意でクリック再生）。
