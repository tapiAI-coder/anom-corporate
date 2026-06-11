// UseCases セクション（v3 リデザイン）
// Bento Grid + Glassmorphism カード + グラデーションアクセント

import { motion, useReducedMotion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";

interface UseCase {
  num: string;
  label: string;
  title: string;
  body: string;
}

const USE_CASES: UseCase[] = [
  {
    num: "01",
    label: "CONSTRUCTION",
    title: "書類と写真を、AIで軽く",
    body: "紙の工程管理・現場写真・見積作成で事務が飽和する建設・土木。OCR と業務フロー自動化で事務負担を削減し、現場監督が本来の業務に戻れる状態へ。",
  },
  {
    num: "02",
    label: "RETAIL & FOOD",
    title: "売上データを、発注判断に",
    body: "POS はあるのに活かせない。発注はベテランの勘頼り。売上予測と発注提案の仕組み化で、属人化と廃棄ロスを同時に減らす。",
  },
  {
    num: "03",
    label: "MANUFACTURING",
    title: "熟練の目を、AIで補完する",
    body: "外観検査が属人化し、技術承継に時間がかかる製造業。画像 AI による検査補助と、社内ナレッジ検索基盤で若手が自走できる体制へ。",
  },
  {
    num: "04",
    label: "SERVICES",
    title: "問い合わせを、AIと分業する",
    body: "電話・メール対応で本業が進まない士業・サービス業。よくある質問の一次対応、議事録・文書の下書き自動化で、専門業務に集中できる環境を。",
  },
];

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

export default function UseCasesSection() {
  const reduced = useReducedMotion();
  const containerVariants = makeContainerVariants();
  const childVariants = makeChildVariants(reduced ?? false);

  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-15%" });

  const gridRef = useRef<HTMLDivElement>(null);
  const gridInView = useInView(gridRef, { once: true, margin: "-15%" });

  return (
    <section className="relative py-24 md:py-32 lg:py-40" style={{ background: "transparent" }}>
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
            02 / USECASES
          </motion.p>

          <motion.h2
            variants={childVariants}
            className="font-v2-display mt-6 text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl"
          >
            こんな現場に、届けます。
          </motion.h2>

          <motion.p
            variants={childVariants}
            className="font-v2-sans mt-8 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg"
          >
            以下は、秋田の中小企業でよく伺う課題と、ANOM のアプローチ例です。
            実績ではなく「こういう入口があります」という想定シナリオとして参考にしてください。
            御社の業種・規模に合わせた入口は、ご一緒に探します。
          </motion.p>
        </motion.div>

        {/* Bento Grid — 2×2 Glassmorphism カード */}
        <motion.div
          ref={gridRef}
          variants={containerVariants}
          initial="hidden"
          animate={gridInView ? "visible" : "hidden"}
          className="mt-16 grid grid-cols-1 gap-4 md:mt-20 md:grid-cols-2 md:gap-5"
        >
          {USE_CASES.map((useCase) => (
            <motion.article
              key={useCase.num}
              variants={childVariants}
              whileHover={reduced ? {} : { y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="glass-card-v3 gradient-border-hover group p-8 md:p-10"
            >
              {/* 番号＋業種ラベル — グラデーションテキスト */}
              <p className="font-v2-mono gradient-text-v3 text-xs uppercase tracking-[0.25em]">
                {useCase.num} / {useCase.label}
              </p>

              {/* タイトル */}
              <h3 className="font-v2-display mt-4 text-lg font-semibold text-white md:text-2xl">
                {useCase.title}
              </h3>

              {/* 本文 */}
              <p className="font-v2-sans mt-4 text-sm leading-relaxed text-white/70 md:text-base">
                {useCase.body}
              </p>

              {/* ボトムライン — ホバー時にグラデーション発光 */}
              <div
                className="mt-8 h-px w-full transition-all duration-500"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
                }}
              />
            </motion.article>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
