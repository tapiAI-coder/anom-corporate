/**
 * GradientBorder — v3 グラデーション境界ラッパー
 *
 * ボタンや独立要素の境界を blue→violet グラデーションで光らせる。
 * GlassCard とは独立して使用可能。
 *
 * 使い方（常時発光）:
 *   <GradientBorder always>
 *     <button>送信</button>
 *   </GradientBorder>
 *
 * 使い方（ホバー時のみ発光、デフォルト）:
 *   <GradientBorder>
 *     <a href="/contact">お問い合わせ</a>
 *   </GradientBorder>
 *
 * プロパティ:
 *   - `always`: 常時発光（デフォルト false = ホバー時のみ）
 *   - `thickness`: 境界線の太さ px（デフォルト 1）
 *   - `radius`: 角丸の Tailwind クラス（デフォルト "rounded-xl"）
 *   - `className`: 追加のクラス
 */

import type { ReactNode, HTMLAttributes } from "react";

interface GradientBorderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** 常時発光（デフォルト false = ホバー時のみ） */
  always?: boolean;
  /** 境界線の太さ px（デフォルト 1） */
  thickness?: number;
  /** 角丸の Tailwind クラス（デフォルト "rounded-xl"） */
  radius?: string;
  /** 追加クラス */
  className?: string;
}

export default function GradientBorder({
  children,
  always = false,
  thickness = 1,
  radius = "rounded-xl",
  className = "",
  ...rest
}: GradientBorderProps) {
  // 常時発光の場合は opacity を 1 にするインラインスタイル
  // ホバー時のみの場合は gradient-border-hover クラスに任せる
  const style: React.CSSProperties = {
    // CSS カスタムプロパティで thickness を渡す
    // （CSS 側で padding として使う場合に備え）
    // 現状の .gradient-border-hover は padding: 1px 固定なので、
    // thickness が 1 以外の場合は inline style で上書きする必要がある
    ...(thickness !== 1
      ? ({ "--border-thickness": `${thickness}px` } as React.CSSProperties)
      : {}),
  };

  const classes = [
    "relative",
    "inline-block",
    radius,
    "gradient-border-hover",
    always ? "gradient-border-always" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={style} {...rest}>
      {children}
    </div>
  );
}
