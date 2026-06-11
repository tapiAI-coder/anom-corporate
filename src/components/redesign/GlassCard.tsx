/**
 * GlassCard — v3 Glassmorphism カード共通コンポーネント
 *
 * 使い方:
 *   <GlassCard>
 *     <h3>見出し</h3>
 *     <p>本文</p>
 *   </GlassCard>
 *
 * プロパティ:
 *   - `hover`: ホバー時に scale + y + グラデーション発光（デフォルト true）
 *   - `gradientBorder`: 常時グラデーション境界を表示（デフォルト false）
 *   - `className`: 追加のクラス（padding などをここで指定）
 *
 * デザイン仕様: CLAUDE.md セクション 4
 * 依存: global.css の .glass-card-v3 / .gradient-border-hover クラス
 */

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode, HTMLAttributes } from "react";

interface GlassCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"> {
  children: ReactNode;
  /** ホバーエフェクトを有効化（デフォルト true） */
  hover?: boolean;
  /** 常時グラデーション境界を表示（デフォルト false） */
  gradientBorder?: boolean;
  /** 追加クラス（padding など） */
  className?: string;
}

export default function GlassCard({
  children,
  hover = true,
  gradientBorder = false,
  className = "",
  ...rest
}: GlassCardProps) {
  const prefersReducedMotion = useReducedMotion();

  // クラス合成
  // - .glass-card-v3: global.css で定義。base bg + hover glow を担当
  // - .gradient-border-hover: 常時グラデ境界（オプション）
  const classes = [
    "glass-card-v3",
    "rounded-2xl",
    gradientBorder ? "gradient-border-hover" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // ホバー時の transform（reduced-motion 時は無効）
  const hoverProps =
    hover && !prefersReducedMotion
      ? {
          whileHover: {
            scale: 1.02,
            y: -5,
            transition: {
              type: "spring" as const,
              stiffness: 400,
              damping: 25,
            },
          },
        }
      : {};

  return (
    <motion.div className={classes} {...hoverProps} {...rest}>
      {children}
    </motion.div>
  );
}
