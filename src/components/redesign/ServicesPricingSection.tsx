// Services & Pricing セクション（v3 リデザイン）
// Bento Grid + Glassmorphism + style prop 廃止（Hydration 警告解消）

import { motion, useReducedMotion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";

interface ServicesPricingSectionProps {
  contactHref: string;
}

interface ServiceColumn {
  numLabel: string;
  titleJa: string;
  catchCopy: string;
  description: string;
  listLabel: string;
  listItems: string[];
  pricingText: string;
  fitForText: string;
}

const SERVICES: ServiceColumn[] = [
  {
    numLabel: "01 / ADVISORY",
    titleJa: "月額顧問",
    catchCopy: "経営と現場の、外付けの頭脳。",
    description:
      "中長期で伴走し、相談・選定・運用を一気通貫で支援。定額で予算化しやすく、継続的な変化を生む設計です。",
    listLabel: "INCLUDES",
    listItems: [
      "経営・事業判断への AI / DX 相談",
      "ツール選定の中立アドバイス",
      "月次の振り返りと次アクション設計",
      "導入後の継続サポート",
    ],
    pricingText: "月額制（規模に応じて個別見積）",
    fitForText: "相談相手を社内に置きたい / 中長期で変えていきたい",
  },
  {
    numLabel: "02 / PROJECT",
    titleJa: "プロジェクト型",
    catchCopy: "課題ごとに、期間と成果を決めて。",
    description:
      "明確なゴールを設定して取り組む単発型。スピード感を持って、特定の課題にフォーカスします。",
    listLabel: "MENU",
    listItems: [
      "現状診断（DX・AI 準備度調査）",
      "業務フロー改善設計",
      "AI ツール導入支援(設定・研修)",
      "導入後の定着サポート",
    ],
    pricingText: "プロジェクト単位（規模に応じて見積）",
    fitForText: "特定の課題を解決したい / 期間を決めて進めたい",
  },
];

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function makeContainerVariants(): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1, delayChildren: 0.15 },
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

export default function ServicesPricingSection({ contactHref }: ServicesPricingSectionProps) {
  const reduced = useReducedMotion();
  const containerVariants = makeContainerVariants();
  const childVariants = makeChildVariants(reduced ?? false);
  const ctaTransition = { type: "spring", stiffness: 400, damping: 17 } as const;

  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-15%" });

  const gridRef = useRef<HTMLDivElement>(null);
  const gridInView = useInView(gridRef, { once: true, margin: "-15%" });

  return (
    <section
      id="services"
      className="relative scroll-mt-24 py-24 md:py-32 lg:py-40"
      style={{ background: "transparent" }}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* セクションヘッダ */}
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
            03 / SERVICES & PRICING
          </motion.p>

          <motion.h2
            variants={childVariants}
            className="font-v2-display mt-6 text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl"
          >
            関わり方を、2 つから選ぶ。
          </motion.h2>

          <motion.p
            variants={childVariants}
            className="font-v2-sans mt-8 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg"
          >
            ANOM の支援は、継続的な伴走（月額顧問型）と、明確なゴールを持つプロジェクト型（単発）の
            2 つから選べます。どちらも、秋田の中小企業に合わせた設計で無駄を削ぎ、
            自社で回せる状態まで伴走します。
          </motion.p>
        </motion.div>

        {/* Bento Grid — 2 列 Glassmorphism カード */}
        <motion.div
          ref={gridRef}
          variants={containerVariants}
          initial="hidden"
          animate={gridInView ? "visible" : "hidden"}
          className="mt-16 grid grid-cols-1 gap-4 md:mt-20 md:grid-cols-2 md:gap-5"
        >
          {SERVICES.map((service) => (
            <motion.div
              key={service.numLabel}
              variants={childVariants}
              whileHover={reduced ? {} : { y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="glass-card-v3 gradient-border-hover flex flex-col p-8 md:p-10 lg:p-12"
            >
              {/* 番号ラベル — グラデーション */}
              <p className="font-v2-mono gradient-text-v3 text-xs uppercase tracking-[0.25em]">
                {service.numLabel}
              </p>

              {/* 日本語タイトル */}
              <h3 className="font-v2-display mt-3 text-xl text-white md:text-2xl">
                {service.titleJa}
              </h3>

              {/* キャッチコピー */}
              <p className="font-v2-display mt-6 text-lg font-semibold text-white md:text-xl">
                {service.catchCopy}
              </p>

              {/* 説明本文 */}
              <p className="font-v2-sans mt-4 text-sm leading-relaxed text-white/70 md:text-base">
                {service.description}
              </p>

              {/* 区切り */}
              <div className="my-8 h-px w-12 bg-white/10" />

              {/* INCLUDES / MENU ラベル */}
              <p className="font-v2-mono text-xs uppercase tracking-[0.2em] text-white/40">
                {service.listLabel}
              </p>

              {/* 箇条書き */}
              <ul className="mt-3 space-y-2">
                {service.listItems.map((item) => (
                  <li
                    key={item}
                    className="font-v2-sans flex gap-3 text-sm leading-relaxed text-white/70"
                  >
                    <span aria-hidden="true" className="flex-shrink-0 text-white/30">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* 区切り */}
              <div className="my-8 h-px w-12 bg-white/10" />

              {/* PRICING */}
              <p className="font-v2-mono text-xs uppercase tracking-[0.2em] text-white/40">
                PRICING
              </p>
              <p className="font-v2-sans mt-2 text-sm leading-relaxed text-white/70">
                {service.pricingText}
              </p>

              {/* FIT FOR */}
              <p className="font-v2-mono mt-6 text-xs uppercase tracking-[0.2em] text-white/40">
                FIT FOR
              </p>
              <p className="font-v2-sans mt-2 text-sm leading-relaxed text-white/70">
                {service.fitForText}
              </p>

              {/* CTA — flex-grow で下部に押し下げ */}
              <div className="mt-10 flex flex-grow items-end">
                <motion.a
                  href={contactHref}
                  whileHover={reduced ? {} : { scale: 1.03 }}
                  whileTap={reduced ? {} : { scale: 0.97 }}
                  transition={ctaTransition}
                  className="group inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] px-8 py-4 text-sm font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.25)] transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2"
                >
                  詳しく相談する
                  <ArrowIcon />
                </motion.a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
