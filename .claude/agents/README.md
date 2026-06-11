# anom-corporate サブエージェント一覧

このフォルダのエージェントは **anom-corporate リポジトリの v3 改修作業** を役割別に分担する。
デザインの方向性（カラー・全体トーン・キャッチコピー等）は意図的に組み込まず、安定した技術ルールのみを記載している。
方向性は `CLAUDE.md` セクション 4（デザインシステム）と セクション 12（ロードマップ）を参照すること。

---

## 役割マトリクス

| エージェント | 担当範囲 | 主に触るファイル |
|---|---|---|
| `astro-islands-developer` | Astro + React + Tailwind v4 のコード実装 | `src/pages/*.astro`, `src/components/redesign/*.tsx`, `src/layouts/*.astro` |
| `threejs-canvas-specialist` | Vanilla Three.js シーン（R3F 禁止） | `src/scripts/anom-*-scene.ts`, `src/components/redesign/*Canvas.tsx` |
| `motion-animator` | Framer Motion のエントリー・微演出 | `src/components/redesign/*.tsx` のアニメ部分 |
| `ui-polisher` | ボタン・カード・フォーム要素の品質向上 | 上に同じ。インタラクティブ要素のみ |
| `browser-verifier` | Claude Preview MCP で動作確認（書き換えはしない） | 検証専用 |
| `astro-build-deploy` | `npm run build` / GitHub Pages 反映確認 | `astro.config.mjs`, `package.json`, `dist/` |
| `security-guardian` | シークレット漏洩・依存脆弱性・XSS / CSP・フォーム攻撃の点検 | 横断的な静的解析と監査 |

---

## 呼び出しの目安

### コード実装が主の場合
- 新規セクション・既存ページ改修 → **`astro-islands-developer`**
- WebGL / canvas を伴う → **`threejs-canvas-specialist`**
- アニメーション設計を含む → **`motion-animator`**
- 既存 UI 要素の hover / focus / a11y 強化 → **`ui-polisher`**

### 検証・運用が主の場合
- 実装後の目視チェック → **`browser-verifier`**
- ビルド失敗の解析 / 本番反映確認 → **`astro-build-deploy`**
- セキュリティ点検（定期 / リリース前 / 新規依存追加時）→ **`security-guardian`**

---

## 並行実行のヒント

ホームページの 1 セクション改修を例にすると、典型的な流れは:

1. `astro-islands-developer` でレイアウト骨格を整える
2. **並行で**:
   - `motion-animator` がアニメ Variants を組み込む
   - `ui-polisher` がボタン・カードのディテールを底上げ
3. `browser-verifier` が 3 解像度で目視確認
4. 問題があれば該当エージェントに差し戻し
5. 仕上がったら `astro-build-deploy` で `npm run build` 確認
6. リリース直前に `security-guardian` で全体点検（依存脆弱性 / dist/ 内のシークレット混入 / 新規 form 実装の攻撃面）

---

## 設計ポリシー

- **役割は重ねない** — 同じファイルを複数エージェントが書き換える場合は順序を明示する
- **デザイン方向の判断はしない** — 色・トーン・コピー変更はメインのオーケストレーター（あなた）が判断する。サブエージェントは決められた方針を実装する側
- **ハマりポイントの共有資産化** — 各エージェントの「既知のハマりポイント」セクションは、過去のセッションで遭遇した罠を記録する場所。新しい罠を見つけたら追記する
