// Hero セクション前景コンポーネント（v3 Phase A' — リッチエントリー演出）
// シーケンス:
//   1) キャッチコピー「無駄を削ぎ落とし、AIで自走する組織へ。」を文字ごとに blur→clear でフェードイン
//   2) 続けて「ANOM」が 1 文字ずつ spring + blur + scale で劇的に現出
//   3) タグライン／区切り線／サブコピー／CTA が順に立ち上がる
//
// 視覚順（DOM 上から下）は従来通り ANOM → タグライン → 区切り → キャッチコピー → サブコピー → CTA。
// 時間軸だけをキャッチコピー先行に並べ替えている（レイアウトの重心はそのまま）。
//
// prefers-reduced-motion の場合は全演出を簡易フェードに置換。

import { motion, useReducedMotion } from "framer-motion";

// ===== Props 定義 =====
interface HeroV2Props {
  /** お問い合わせページのURL */
  contactHref: string;
  /** サービス（ホーム内アンカー）のURL */
  servicesHref: string;
}

// ===== 演出タイムライン（秒） =====
// 全体完了（最後の CTA フェードイン終了）が約 2.5s になるようチューニング
const TIMELINE = {
  // キャッチコピー（18 文字 * 0.028s ≒ 0.5s で出揃う）
  catchphraseStart: 0.15,
  catchphraseStep: 0.028,
  catchphraseDuration: 0.5,
  // ANOM 見出し（キャッチ後半とわずかに重ねて発火）
  anomStart: 0.95,
  anomStep: 0.09,
  anomDuration: 0.55,
  // その他メタ要素（ANOM 完了を追いかけるように連続させる）
  taglineStart: 1.6,
  dividerStart: 1.7,
  subcopyStart: 1.8,
  ctaStart: 1.95,
  ctaStep: 0.06,
} as const;

// キャッチコピー文字列（分割して <br> を挟めるようにする）
const CATCH_LINE_1 = "無駄を削ぎ落とし、";
const CATCH_LINE_2 = "AIで自走する組織へ。";

// ===== SVG 矢印アイコン =====
function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

// ===== キャッチコピー 1 文字 =====
// index: 全文字列を通した通し番号（delay 計算用）
function CatchChar({
  ch,
  index,
  reduced,
}: {
  ch: string;
  index: number;
  reduced: boolean | null;
}) {
  if (reduced) {
    return <span>{ch}</span>;
  }
  return (
    <motion.span
      aria-hidden="true"
      initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        delay: TIMELINE.catchphraseStart + index * TIMELINE.catchphraseStep,
        duration: TIMELINE.catchphraseDuration,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ display: "inline-block", willChange: "transform, opacity, filter" }}
    >
      {ch}
    </motion.span>
  );
}

// ===== メインコンポーネント =====
export default function HeroV2({ contactHref, servicesHref }: HeroV2Props) {
  const prefersReducedMotion = useReducedMotion();

  // CTA ホバー・タップのトランジション設定
  const ctaTransition = { type: "spring", stiffness: 400, damping: 17 } as const;

  // 全文字を通し番号で展開するためのカウンタ
  const line1Chars = Array.from(CATCH_LINE_1);
  const line2Chars = Array.from(CATCH_LINE_2);
  const anomLetters = ["A", "N", "O", "M"];

  return (
    <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
      <div className="flex flex-col items-center">
        {/* ===== ANOM 見出し（1 文字ずつ劇的に出現） ===== */}
        <h1
          aria-label="ANOM"
          className="relative font-v2-display font-bold tracking-[0.08em] text-6xl sm:text-7xl md:text-8xl lg:text-9xl"
          style={{ color: "var(--color-v2-text)" }}
        >
          {/* 背景に滲む光。ANOM 最初の文字登場と同時にフェードイン */}
          {!prefersReducedMotion && (
            <motion.span
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: TIMELINE.anomStart - 0.1,
                duration: 1.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(139,92,246,0.22), rgba(59,130,246,0.12) 45%, transparent 75%)",
              }}
            />
          )}

          {prefersReducedMotion
            ? "ANOM"
            : anomLetters.map((letter, i) => (
                <motion.span
                  key={letter}
                  aria-hidden="true"
                  initial={{ opacity: 0, y: 48, filter: "blur(28px)", scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                  transition={{
                    delay: TIMELINE.anomStart + i * TIMELINE.anomStep,
                    duration: TIMELINE.anomDuration,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{ display: "inline-block", willChange: "transform, opacity, filter" }}
                >
                  {letter}
                </motion.span>
              ))}
        </h1>

        {/* タグライン */}
        <motion.p
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{
            delay: TIMELINE.taglineStart,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-6 font-v2-mono font-light uppercase tracking-[0.35em] text-xs md:text-sm"
          style={{ color: "var(--color-v2-text-subtle)" }}
        >
          AUTONOMOUS + MINIMALISM
        </motion.p>

        {/* 区切り線 — scaleX で中央から広がる */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scaleX: 0 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scaleX: 1 }}
          transition={{
            delay: TIMELINE.dividerStart,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto mt-10 h-px w-16 origin-center md:w-24"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)",
          }}
        />

        {/* ===== キャッチコピー（最初に立ち上がる主役） ===== */}
        <p
          aria-label={`${CATCH_LINE_1}${CATCH_LINE_2}`}
          className="mt-10 font-medium leading-relaxed text-xl md:text-3xl"
          style={{ color: "var(--color-v2-text)" }}
        >
          {/* 1 行目 */}
          {line1Chars.map((ch, i) => (
            <CatchChar
              key={`l1-${i}`}
              ch={ch}
              index={i}
              reduced={prefersReducedMotion}
            />
          ))}
          {/* モバイルのみ改行 */}
          <br className="md:hidden" />
          {/* 2 行目（通し番号を継続） */}
          {line2Chars.map((ch, i) => (
            <CatchChar
              key={`l2-${i}`}
              ch={ch}
              index={line1Chars.length + i}
              reduced={prefersReducedMotion}
            />
          ))}
        </p>

        {/* サブコピー */}
        <motion.p
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{
            delay: TIMELINE.subcopyStart,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-5 text-sm leading-relaxed md:text-base"
          style={{ color: "var(--color-v2-text-body)" }}
        >
          秋田の中小企業のDX・AI導入を、戦略から定着まで伴走支援。
        </motion.p>

        {/* ===== CTA ボタン群 ===== */}
        <div className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {/* 主 CTA */}
          <motion.a
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{
              delay: TIMELINE.ctaStart,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            href={contactHref}
            whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
            // hover/tap 用の spring は別指定（entry は上記 ease）
            style={{ color: "#0A0A0B" }}
            className="group relative inline-flex min-h-[48px] items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-accent focus-visible:ring-offset-2 focus-visible:ring-offset-v2-bg"
          >
            無料相談する
            <ArrowIcon />
          </motion.a>

          {/* 副 CTA */}
          <motion.a
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{
              delay: TIMELINE.ctaStart + TIMELINE.ctaStep,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            href={servicesHref}
            whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
            style={{ color: "rgba(255,255,255,0.7)" }}
            className="group inline-flex min-h-[48px] items-center gap-2 rounded-full border border-white/10 px-8 py-4 text-sm font-medium transition-all duration-300 hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-accent focus-visible:ring-offset-2 focus-visible:ring-offset-v2-bg"
          >
            サービスを見る
            <ArrowIcon />
          </motion.a>
        </div>
      </div>
    </div>
  );
}

// ctaTransition は hover/tap 用に残していたが spring は whileHover/Tap に内包されるため不要。
