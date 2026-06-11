// Final CTA セクション（v3 リデザイン）
// ページ末尾の締め。グラデーション CTA + Glassmorphism 情報パネル

import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useRef } from "react";

interface InfoItem {
  label: string;
  value: string;
}

const INFO: InfoItem[] = [
  { label: "LOCATION", value: "秋田県（全国リモート対応可）" },
  { label: "HOURS", value: "平日 9:00–18:00（JST）" },
  { label: "EMAIL", value: "info@anom-ai.com" },
  { label: "SESSION", value: "初回 30〜60 分（オンライン）" },
];

interface FinalCTASectionProps {
  contactHref: string;
}

function makeContainerVariants(): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  };
}

function makeChildVariants(reduced: boolean | null): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.3 } },
    };
  }
  return {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 60, damping: 22 },
    },
  };
}

export default function FinalCTASection({ contactHref }: FinalCTASectionProps) {
  const reduced = useReducedMotion();
  const containerVariants = makeContainerVariants();
  const childVariants = makeChildVariants(reduced ?? false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-15%" });

  const ctaTransition = { type: "spring", stiffness: 400, damping: 17 } as const;

  return (
    <section
      className="relative border-t border-white/10 py-24 md:py-32 lg:py-40"
      style={{ background: "transparent" }}
    >
      {/* 背景グラデーションアンビエント — 中央下に薄く青紫の発光 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-30 blur-[120px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99,102,241,0.25), rgba(139,92,246,0.15) 40%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center md:px-8">
        <motion.div
          ref={sectionRef}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.p
            variants={childVariants}
            className="font-v2-mono text-xs uppercase tracking-[0.25em] text-white/40"
          >
            06 / CONTACT
          </motion.p>

          <motion.h2
            variants={childVariants}
            className="font-v2-display mt-6 text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl"
          >
            まず、
            <br />
            話してみませんか。
          </motion.h2>

          {/* 区切り線（中央から広がる）— グラデーション */}
          <motion.div
            variants={childVariants}
            className="mx-auto mt-10 h-px w-16 md:w-24"
            style={{
              background: "linear-gradient(to right, transparent, #8b5cf6, transparent)",
            }}
          />

          <motion.p
            variants={childVariants}
            className="font-v2-sans mt-10 text-base leading-relaxed text-white/70 md:text-lg"
          >
            初回相談は無料です。
            <br className="hidden md:inline" />
            「何から始めればいいかわからない」という段階からで、大丈夫です。
          </motion.p>

          {/* 基本情報パネル — Glassmorphism 化 */}
          <motion.div
            variants={childVariants}
            className="glass-card-v3 mx-auto mt-14 grid max-w-2xl grid-cols-1 sm:grid-cols-2"
          >
            {INFO.map((item, index) => {
              const borderClasses: string[] = [];
              if (index > 0) borderClasses.push("border-t border-white/10");
              if (index % 2 === 1) borderClasses.push("sm:border-l sm:border-white/10");
              if (index >= 2) {
                borderClasses.push("sm:border-t sm:border-white/10");
              } else {
                borderClasses.push("sm:border-t-0");
              }
              return (
                <div key={item.label} className={["px-6 py-5 text-left", ...borderClasses].join(" ")}>
                  <p className="font-v2-mono text-[10px] tracking-[0.25em] text-white/40">
                    {item.label}
                  </p>
                  <p className="font-v2-sans mt-2 text-sm text-white/80">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </motion.div>

          {/* CTA ボタン — グラデーション */}
          <motion.div variants={childVariants} className="mt-14">
            <motion.a
              href={contactHref}
              whileHover={reduced ? {} : { scale: 1.03 }}
              whileTap={reduced ? {} : { scale: 0.97 }}
              transition={ctaTransition}
              className="group relative inline-flex min-h-[56px] items-center gap-2 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] px-10 py-4 text-base font-semibold text-white shadow-[0_0_40px_rgba(99,102,241,0.35)] transition-shadow duration-300 hover:shadow-[0_0_60px_rgba(99,102,241,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2"
            >
              無料相談する
              <svg
                aria-hidden="true"
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
