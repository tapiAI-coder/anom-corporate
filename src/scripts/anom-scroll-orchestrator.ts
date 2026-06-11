/**
 * anom-scroll-orchestrator.ts — スクロール演出 & マウス入力の統括
 *
 * 役割:
 *   - GSAP ScrollTrigger で Hero セクションを trigger とし、スクロール進捗 0..1 を取得
 *   - 進捗を anom-core-scene の setScrollProgress に渡す（→ 動画の currentTime を同期）
 *   - マウス移動を監視し、NDC 風正規化座標を setMouseNormalized に渡す（→ カメラパララックス）
 *
 * 使い方:
 *   import { startAnomCoreScene } from "./anom-core-scene";
 *   import { startAnomScrollOrchestrator } from "./anom-scroll-orchestrator";
 *   const core = startAnomCoreScene("neural-canvas");
 *   startAnomScrollOrchestrator(core);
 *
 * 制約:
 *   - ScrollTrigger と Lenis は BaseLayout.astro 側で連携済み
 *     （gsap.ticker.add + lenis.on("scroll", ScrollTrigger.update)）
 *     → ここではプラグイン登録のみ冪等に行う
 *   - prefers-reduced-motion: reduce の場合は scrub を無効化し、動画は最終フレーム静止
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { AnomCoreSceneHandle } from "./anom-core-scene";

// プラグイン登録は冪等（既に登録済みなら no-op）
gsap.registerPlugin(ScrollTrigger);

// ===== 環境判定 =====
const isMobile =
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * スクロール / マウス演出を起動
 * @param core anom-core-scene の handle
 * @param options 設定
 */
export function startAnomScrollOrchestrator(
  core: AnomCoreSceneHandle,
  options: {
    /** Hero セクションの CSS セレクタ（省略時 [data-hero-section]） */
    heroSelector?: string;
    /** スクロール scrub の慣性（0 に近いほど即時、1 に近いほどゆっくり追従） */
    scrub?: number;
  } = {}
): { destroy: () => void } {
  const { heroSelector = "[data-hero-section]", scrub = 0.8 } = options;

  const heroEl = document.querySelector<HTMLElement>(heroSelector);
  if (!heroEl) {
    console.warn(`[anom-scroll-orchestrator] Hero セクション ${heroSelector} が見つかりません`);
  }

  // ========== ScrollTrigger 設定 ==========
  let scrollTrigger: ScrollTrigger | null = null;

  if (heroEl) {
    // 動画 scrub はスクロール連動（受動的）なので prefers-reduced-motion でも有効化する。
    // reduced-motion では Lenis 慣性スクロールが切れるため scrub が即時反映される（scrub 値は無視される）。
    scrollTrigger = ScrollTrigger.create({
      trigger: heroEl,
      start: "top top",
      end: "bottom top", // Hero 1 画面分のスクロールで進捗 0→1
      scrub: prefersReducedMotion ? true : scrub,
      onUpdate: (self) => {
        core.setScrollProgress(self.progress);
      },
    });
  }

  // ========== マウス入力 ==========
  let mouseHandler: ((e: MouseEvent) => void) | null = null;
  if (!isMobile && !prefersReducedMotion) {
    mouseHandler = (e: MouseEvent) => {
      // 画面中央を 0, 端を ±1 に正規化
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      core.setMouseNormalized(nx, ny);
    };
    window.addEventListener("mousemove", mouseHandler, { passive: true });
  }

  // ========== 破棄 ==========
  function destroy() {
    if (scrollTrigger) {
      scrollTrigger.kill();
      scrollTrigger = null;
    }
    if (mouseHandler) {
      window.removeEventListener("mousemove", mouseHandler);
      mouseHandler = null;
    }
  }

  return { destroy };
}
