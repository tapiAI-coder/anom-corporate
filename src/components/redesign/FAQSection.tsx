// FAQ セクション（v3 リデザイン）
// sticky 見出し + アコーディオン。style prop を Tailwind クラスへ移行（Hydration 警告解消）

import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { useRef, useState } from "react";

interface FAQItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    q: "AI を導入したことがない企業でも大丈夫ですか？",
    a: "はい、初めての企業様が大半です。現状診断から始めて「何から手を付けるべきか」を一緒に整理するところからご支援します。いきなりツールを導入することはありません。",
  },
  {
    q: "費用はどのくらいかかりますか？",
    a: "規模・内容により異なります。まず無料相談で状況を伺い、概算をご提示します。月額顧問・プロジェクト単発、どちらもスモールスタート可能です。",
  },
  {
    q: "秋田県外でも対応できますか？",
    a: "はい、全国対応しています。原則リモート中心で、必要に応じて現地訪問も対応可能です。秋田と関東の距離を埋めるために ANOM は動きます。",
  },
  {
    q: "どのくらいの期間で成果が出ますか？",
    a: "PoC（試験導入）は 1〜3 ヶ月、本格導入は 3〜6 ヶ月が目安です。プロジェクトの複雑さや社内体制により変わりますが、早期の効果創出を重視します。",
  },
  {
    q: "データが少なくても AI は使えますか？",
    a: "データの量と質でアプローチは変わりますが、少量でも有効な手法があります。まずは現状のデータをご共有いただき、可能性を診断させてください。",
  },
  {
    q: "社内の人間だけで運用できるようになりますか？",
    a: "内製化支援も中心メニューの一つです。導入後に自走できるよう、研修・ドキュメント整備・技術移転まで伴走します。",
  },
];

function makeContainerVariants(): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.06, delayChildren: 0.15 },
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
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 60, damping: 22 },
    },
  };
}

interface FAQRowProps {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  childVariants: Variants;
  reduced: boolean | null;
}

function FAQRow({ item, index, isOpen, onToggle, childVariants, reduced }: FAQRowProps) {
  const panelId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <motion.div
      variants={childVariants}
      className={[
        "relative border-t transition-colors duration-300",
        index === 0 ? "border-transparent" : "border-white/10",
        isOpen ? "bg-white/[0.02]" : "",
      ].join(" ")}
    >
      {/* 左端のグラデーションマーカー（開いた時に発光） */}
      <span
        aria-hidden="true"
        className={[
          "absolute left-0 top-0 bottom-0 w-px transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        ].join(" ")}
        style={{
          background: "linear-gradient(180deg, #3b82f6, #8b5cf6)",
        }}
      />

      <button
        id={buttonId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="group flex w-full items-center justify-between gap-4 px-2 py-6 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 md:px-4 md:py-7"
      >
        <span
          className={[
            "font-v2-sans text-sm font-medium leading-relaxed transition-colors duration-200 md:text-base",
            isOpen ? "text-white" : "text-white/70 group-hover:text-white/90",
          ].join(" ")}
        >
          {item.q}
        </span>
        {/* プラス→クロス アイコン */}
        <span
          aria-hidden="true"
          className={[
            "font-v2-mono inline-block flex-shrink-0 text-base text-white/40",
            reduced ? "" : "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          ].join(" ")}
          style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{
              duration: reduced ? 0.2 : 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ overflow: "hidden" }}
          >
            <p className="font-v2-sans px-2 pb-6 text-sm leading-[1.9] text-white/70 md:px-4 md:pb-7 md:text-[15px]">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const reduced = useReducedMotion();
  const containerVariants = makeContainerVariants();
  const childVariants = makeChildVariants(reduced ?? false);

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-15%" });

  const listRef = useRef<HTMLDivElement>(null);
  const listInView = useInView(listRef, { once: true, margin: "-15%" });

  return (
    <section className="relative py-24 md:py-32 lg:py-40" style={{ background: "transparent" }}>
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
          {/* 左: sticky 見出し */}
          <motion.div
            ref={headerRef}
            variants={containerVariants}
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <motion.p
              variants={childVariants}
              className="font-v2-mono text-xs uppercase tracking-[0.25em] text-white/40"
            >
              04 / FAQ
            </motion.p>

            <motion.h2
              variants={childVariants}
              className="font-v2-display mt-6 text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-[2.75rem] xl:text-5xl"
            >
              疑問に、お答えします。
            </motion.h2>

            <motion.p
              variants={childVariants}
              className="font-v2-sans mt-6 text-sm leading-relaxed text-white/70 md:text-base"
            >
              ここにない疑問は、お気軽にご相談ください。
              <br className="hidden md:inline" />
              初回相談は無料です。
            </motion.p>
          </motion.div>

          {/* 右: アコーディオン */}
          <motion.div
            ref={listRef}
            variants={containerVariants}
            initial="hidden"
            animate={listInView ? "visible" : "hidden"}
            className="flex flex-col border-b border-white/10"
          >
            {FAQ_ITEMS.map((item, index) => (
              <FAQRow
                key={index}
                item={item}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex((prev) => (prev === index ? null : index))}
                childVariants={childVariants}
                reduced={reduced}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
