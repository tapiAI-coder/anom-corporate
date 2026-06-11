// Resources（資料 DL）セクション（v3 リデザイン）
// 準備中 UI を Glassmorphism Bento カードに刷新

import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useRef } from "react";

interface Resource {
  tag: string;
  title: string;
  desc: string;
  pages: string;
}

const RESOURCES: Resource[] = [
  {
    tag: "SERVICE",
    title: "ANOM サービス概要資料",
    desc: "月額顧問・プロジェクト型の料金、支援範囲、導入の流れをまとめた紹介資料。",
    pages: "約 12p",
  },
  {
    tag: "CASES",
    title: "秋田向け AI 活用シナリオ集",
    desc: "建設・小売・製造・サービス業で、どこから AI を入れるか。業種別の想定事例。",
    pages: "約 20p",
  },
  {
    tag: "CHECK",
    title: "DX 準備度チェックシート",
    desc: "自社の業務フロー・データ・体制を 20 項目で自己診断できるシート。",
    pages: "約 4p",
  },
];

interface DownloadSectionProps {
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

export default function DownloadSection({ contactHref }: DownloadSectionProps) {
  const reduced = useReducedMotion();
  const containerVariants = makeContainerVariants();
  const childVariants = makeChildVariants(reduced ?? false);

  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-15%" });

  const gridRef = useRef<HTMLDivElement>(null);
  const gridInView = useInView(gridRef, { once: true, margin: "-15%" });

  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: "-15%" });

  const ctaTransition = { type: "spring", stiffness: 400, damping: 17 } as const;

  return (
    <section className="relative py-24 md:py-32 lg:py-40" style={{ background: "transparent" }}>
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* ヘッダ */}
        <motion.div
          ref={headerRef}
          variants={containerVariants}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
        >
          <motion.p
            variants={childVariants}
            className="font-v2-mono text-xs uppercase tracking-[0.25em] text-white/40"
          >
            05 / RESOURCES
          </motion.p>

          <motion.h2
            variants={childVariants}
            className="font-v2-display mt-6 text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl"
          >
            資料を、準備しています。
          </motion.h2>

          <motion.p
            variants={childVariants}
            className="font-v2-sans mt-8 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg"
          >
            公開準備中の資料です。完成次第、こちらからダウンロードいただけます。
            いま内容を知りたい方は、無料相談で直接お話しください。
          </motion.p>
        </motion.div>

        {/* リソースグリッド */}
        <motion.div
          ref={gridRef}
          variants={containerVariants}
          initial="hidden"
          animate={gridInView ? "visible" : "hidden"}
          className="mt-16 grid grid-cols-1 gap-4 md:mt-20 md:grid-cols-2 md:gap-5 lg:grid-cols-3"
        >
          {RESOURCES.map((resource) => (
            <motion.div
              key={resource.tag}
              variants={childVariants}
              whileHover={reduced ? {} : { y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="glass-card-v3 gradient-border-hover flex flex-col p-8 md:p-10"
            >
              {/* TAG + PAGES */}
              <div className="flex items-start justify-between">
                <span className="font-v2-mono gradient-text-v3 text-xs tracking-[0.25em]">
                  {resource.tag}
                </span>
                <span className="font-v2-mono text-[10px] tracking-[0.15em] text-white/40">
                  {resource.pages}
                </span>
              </div>

              {/* タイトル */}
              <h3 className="font-v2-display mt-6 text-lg font-semibold text-white md:text-xl">
                {resource.title}
              </h3>

              {/* 説明 */}
              <p className="font-v2-sans mt-3 text-sm leading-relaxed text-white/70">
                {resource.desc}
              </p>

              {/* PREPARING バッジ */}
              <div className="mt-8 flex flex-grow items-end">
                <div
                  aria-disabled="true"
                  role="button"
                  className="font-v2-mono w-full cursor-not-allowed select-none border border-dashed border-white/15 py-3 text-center text-xs tracking-[0.2em] text-white/40"
                >
                  PREPARING
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 代替 CTA */}
        <motion.div
          ref={ctaRef}
          variants={containerVariants}
          initial="hidden"
          animate={ctaInView ? "visible" : "hidden"}
          className="mt-16 flex flex-col items-center text-center md:mt-20"
        >
          <motion.p
            variants={childVariants}
            className="font-v2-sans text-sm leading-relaxed text-white/70 md:text-base"
          >
            資料公開まで待たずに、いま話したい方はこちら。
          </motion.p>

          <motion.a
            variants={childVariants}
            href={contactHref}
            whileHover={reduced ? {} : { scale: 1.03 }}
            whileTap={reduced ? {} : { scale: 0.97 }}
            transition={ctaTransition}
            className="group mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-full border border-white/10 px-8 py-4 text-sm font-medium text-white/70 transition-all duration-300 hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            無料相談する
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
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
