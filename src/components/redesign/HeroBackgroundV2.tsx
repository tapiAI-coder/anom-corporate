// Hero 背景コンポーネント（v2 再設計）
// グロー blob のパララックス + 繊細なグリッド線を実装
// props 不要（自己完結）

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export default function HeroBackgroundV2() {
  // アクセシビリティ: 動き軽減設定を検知
  const prefersReducedMotion = useReducedMotion();

  // ===== スクロール連動パララックス =====
  // scrollY はページ全体のスクロール量（px）
  const { scrollY } = useScroll();

  // blob1（左上）: スクロール 0〜600px で y が 0〜80px 移動、opacity が 1〜0.4
  const blob1Y = useTransform(scrollY, [0, 600], prefersReducedMotion ? [0, 0] : [0, 80]);
  const blob1Opacity = useTransform(scrollY, [0, 600], prefersReducedMotion ? [1, 1] : [1, 0.4]);

  // blob2（右下）: スクロール 0〜600px で y が 0〜120px 移動、opacity が 1〜0.2
  const blob2Y = useTransform(scrollY, [0, 600], prefersReducedMotion ? [0, 0] : [0, 120]);
  const blob2Opacity = useTransform(scrollY, [0, 600], prefersReducedMotion ? [1, 1] : [1, 0.2]);

  return (
    // ポインターイベントを無効化し、aria-hidden でスクリーンリーダーから隠す
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* ===== 繊細なグリッド線（最背面） ===== */}
      {/* Framer Motion 不要。CSS background-image で静的に描画 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "80px 80px",
          opacity: 0.04,
        }}
      />

      {/* ===== グロー blob1（左上 25% / 上 20%） ===== */}
      {/* v2-accent/20 相当の青紫グロー */}
      <motion.div
        className="absolute h-[420px] w-[420px] rounded-full blur-[120px]"
        style={{
          left: "25%",
          top: "20%",
          // CSS 変数で accent 色を参照（rgba で透明度を付与）
          background: "rgba(123, 139, 219, 0.20)",
          y: blob1Y,
          opacity: blob1Opacity,
        }}
      />

      {/* ===== グロー blob2（右下 25% / 下 15%） ===== */}
      {/* 白の薄いグロー */}
      <motion.div
        className="absolute h-[320px] w-[320px] rounded-full blur-[100px]"
        style={{
          right: "25%",
          bottom: "15%",
          background: "rgba(255, 255, 255, 0.05)",
          y: blob2Y,
          opacity: blob2Opacity,
        }}
      />
    </div>
  );
}
