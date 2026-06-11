// About セクションコンポーネント（v2 再設計 Phase 1b）
// Mission（ANOMの3要素）と「選ばれる理由」を融合した1セクション構成
// HeroV2.tsx のアニメーションパターン（staggerChildren / spring / useReducedMotion）を踏襲

import { motion, useReducedMotion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";
import OrbCanvas from "./OrbCanvas";

// ===== 型定義 =====

// ANOM 3要素カードのデータ型
interface AnomPillar {
  num: string;
  keyword: string;
  subtitle: string;
  description: string;
}

// 「選ばれる理由」カードのデータ型
interface WhyCard {
  num: string;
  heading: string;
  body: string;
}

// ===== コンテンツデータ =====

// ANOM の3要素（Autonomous / Minimalism / Local×Global）
const ANOM_PILLARS: AnomPillar[] = [
  {
    num: "01",
    keyword: "Autonomous",
    subtitle: "自走する組織へ",
    description: "依存しない。ツールも人も、使いこなして前に進める状態をつくる。",
  },
  {
    num: "02",
    keyword: "Minimalism",
    subtitle: "無駄を削ぎ落とす",
    description: "増やすのではなく、減らすことから始める。残ったものだけが効く。",
  },
  {
    num: "03",
    keyword: "Local × Global",
    subtitle: "秋田から、世界水準で",
    description: "地元の商慣習を知る目と、国内外の事例を知る目。両方で判断する。",
  },
];

// 選ばれる4つの理由
const WHY_CARDS: WhyCard[] = [
  {
    num: "01",
    heading: "秋田拠点、リモートで全国対応",
    body: "地元の商慣習を肌で知り、遠隔でも機動的に動く。",
  },
  {
    num: "02",
    heading: "一人体制のスピード",
    body: "意思決定の階層なし。相談から着手までが短い。",
  },
  {
    num: "03",
    heading: "内製化を前提とした伴走",
    body: "ベンダーに依存させない。使いこなせる状態で引き渡す。",
  },
  {
    num: "04",
    heading: "ツール選定の中立性",
    body: "特定ベンダー系列ではない。ROI と現場適合で選ぶ。",
  },
];

// ===== アニメーション Variants ファクトリー =====
// HeroV2 と同じパターン: prefersReducedMotion で y 移動を無効化

function makeContainerVariants(): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };
}

function makeChildVariants(prefersReducedMotion: boolean | null): Variants {
  if (prefersReducedMotion) {
    // 動き軽減時: opacity のみ（y 移動なし）
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.3, ease: "easeOut" },
      },
    };
  }
  // 通常: y 移動 + フェードイン（spring）
  return {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 50, damping: 20 },
    },
  };
}

// ===== メインコンポーネント =====
export default function AboutSection() {
  // アクセシビリティ: 動き軽減設定を検知
  const prefersReducedMotion = useReducedMotion();

  // Variants を生成（prefersReducedMotion に応じて切り替え）
  const containerVariants = makeContainerVariants();
  const childVariants = makeChildVariants(prefersReducedMotion ?? false);

  // ===== useInView フック — 4グループそれぞれ独立してトリガー =====
  // セクションヘッダ
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-15%" });

  // ANOM 3要素カードグループ
  const pillarsRef = useRef<HTMLDivElement>(null);
  const pillarsInView = useInView(pillarsRef, { once: true, margin: "-15%" });

  // WHY ANOM サブセクションタイトル
  const whyTitleRef = useRef<HTMLDivElement>(null);
  const whyTitleInView = useInView(whyTitleRef, { once: true, margin: "-15%" });

  // 4理由グリッド
  const whyGridRef = useRef<HTMLDivElement>(null);
  const whyGridInView = useInView(whyGridRef, { once: true, margin: "-15%" });

  return (
    // section タグからコンポーネント内で完結（Astro 側で section を巻かない）
    <section
      // v3 Phase 1-B: 背景を透過（body の dark + 背後のニューロン canvas を透かす）
      className="relative py-24 md:py-32 lg:py-40"
      style={{ background: "transparent" }}
    >
      {/* ===== コンテナ ===== */}
      <div className="mx-auto max-w-6xl px-4 md:px-8">

        {/* ===== セクションヘッダ（v3 Phase C: 2 カラム / 右に光点球体） ===== */}
        {/* モバイル（< lg）: Orb を上に、テキストを下に積む */}
        {/* PC（lg 以上）: 左テキスト 7 : 右 Orb 5 の 12 カラムグリッド */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* ----- 左カラム: テキスト ----- */}
          <motion.div
            ref={headerRef}
            variants={containerVariants}
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
            className="order-2 lg:order-1 lg:col-span-7"
          >
            {/* モノスペースラベル */}
            <motion.p
              variants={childVariants}
              className="font-v2-mono text-xs uppercase tracking-[0.25em]"
              style={{
                color: "var(--color-v2-text-subtle)",
                fontFamily: "var(--font-v2-mono)",
              }}
            >
              01 / ABOUT
            </motion.p>

            {/* 大見出し */}
            <motion.h2
              variants={childVariants}
              className="mt-6 font-bold tracking-tight text-3xl md:text-5xl lg:text-6xl"
              style={{
                color: "var(--color-v2-text)",
                fontFamily: "var(--font-v2-display)",
              }}
            >
              自律と簡潔を、秋田の現場へ。
            </motion.h2>

            {/* リード段落1 */}
            <motion.p
              variants={childVariants}
              className="mt-8 max-w-2xl text-base leading-relaxed md:text-lg"
              style={{
                color: "var(--color-v2-text-body)",
                fontFamily: "var(--font-v2-sans)",
              }}
            >
              秋田の中小企業と向き合うなかで、確信していることがあります。人の時間は有限で、定型業務はいずれAIに託せる。ANOM は無駄を削ぎ落とし、生まれた余白を本来の仕事と成長に戻します。
            </motion.p>

            {/* リード段落2 */}
            <motion.p
              variants={childVariants}
              className="mt-4 max-w-2xl text-base leading-relaxed md:text-lg"
              style={{
                color: "var(--color-v2-text-body)",
                fontFamily: "var(--font-v2-sans)",
              }}
            >
              関東と同じ景色を、秋田からも。ツールの導入で終わらず、自社で回せる状態まで伴走します。
            </motion.p>
          </motion.div>

          {/* ----- 右カラム: 光点球体 Orb ----- */}
          {/* aspect-square で正方形キャンバスを確保。lg 以上は grid に追従、モバイルは最大 420px */}
          <div className="order-1 flex items-center justify-center lg:order-2 lg:col-span-5">
            <div className="relative aspect-square w-full max-w-[420px] lg:max-w-none">
              <OrbCanvas className="h-full w-full" />
            </div>
          </div>
        </div>

        {/* ===== ANOM 3要素カードグリッド ===== */}
        {/* gap-0 + border で preview 風のボーダー分割グリッドを実現 */}
        <motion.div
          ref={pillarsRef}
          variants={containerVariants}
          initial="hidden"
          animate={pillarsInView ? "visible" : "hidden"}
          className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-3 border border-white/[0.08] rounded-none"
        >
          {ANOM_PILLARS.map((pillar, index) => (
            <motion.div
              key={pillar.num}
              variants={childVariants}
              // 内部区切り線: モバイルは上ボーダー、md 以上は左ボーダー
              // first:border-t-0 と md:first:border-l-0 で最初のセルの二重ボーダーを防ぐ
              className={[
                "p-8 md:p-10",
                index === 0
                  ? ""
                  : "border-t border-white/[0.08] md:border-t-0 md:border-l md:border-white/[0.08]",
              ].join(" ")}
            >
              {/* ラベル番号 */}
              <p
                className="font-v2-mono text-xs"
                style={{
                  color: "var(--color-v2-accent)",
                  fontFamily: "var(--font-v2-mono)",
                }}
              >
                {pillar.num}
              </p>

              {/* キーワード */}
              <p
                className="mt-3 font-bold text-xl md:text-2xl"
                style={{
                  color: "var(--color-v2-text)",
                  fontFamily: "var(--font-v2-display)",
                }}
              >
                {pillar.keyword}
              </p>

              {/* サブタイトル */}
              <p
                className="mt-1 text-sm"
                style={{
                  color: "var(--color-v2-text-body)",
                  fontFamily: "var(--font-v2-sans)",
                }}
              >
                {pillar.subtitle}
              </p>

              {/* 本文説明 */}
              <p
                className="mt-4 text-sm leading-relaxed"
                style={{
                  color: "var(--color-v2-text-body)",
                  fontFamily: "var(--font-v2-sans)",
                }}
              >
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* ===== WHY ANOM サブセクション ===== */}

        {/* サブセクションタイトルブロック */}
        <motion.div
          ref={whyTitleRef}
          variants={containerVariants}
          initial="hidden"
          animate={whyTitleInView ? "visible" : "hidden"}
          className="mt-24 md:mt-32"
        >
          {/* モノスペースラベル */}
          <motion.p
            variants={childVariants}
            className="font-v2-mono text-xs uppercase tracking-[0.25em]"
            style={{
              color: "var(--color-v2-text-subtle)",
              fontFamily: "var(--font-v2-mono)",
            }}
          >
            WHY ANOM
          </motion.p>

          {/* サブ見出し */}
          <motion.h3
            variants={childVariants}
            className="mt-4 font-bold text-2xl md:text-4xl"
            style={{
              color: "var(--color-v2-text)",
              fontFamily: "var(--font-v2-display)",
            }}
          >
            選ばれる 4 つの理由。
          </motion.h3>
        </motion.div>

        {/* 4理由グリッド: gap-0 + ボーダー分割（2列 × 2行） */}
        <motion.div
          ref={whyGridRef}
          variants={containerVariants}
          initial="hidden"
          animate={whyGridInView ? "visible" : "hidden"}
          className="mt-10 grid grid-cols-1 md:grid-cols-2 border border-white/[0.08] rounded-none"
        >
          {WHY_CARDS.map((card, index) => (
            <motion.div
              key={card.num}
              variants={childVariants}
              // 内部区切り線パターン:
              // - モバイル: 最初以外は上ボーダー
              // - md以上: 右列は左ボーダー、下行（index >= 2）は上ボーダー
              className={[
                "p-8 md:p-10",
                // モバイル: 最初のセルを除き上ボーダー
                index === 0 ? "" : "border-t border-white/[0.08]",
                // md以上: 右列（偶数以外、つまり index 1,3）は左ボーダー
                index % 2 === 1 ? "md:border-l md:border-white/[0.08]" : "",
                // md以上: 下行（index 2,3）は上ボーダー（モバイルの border-t を上書き）
                index >= 2 ? "md:border-t md:border-white/[0.08]" : "md:border-t-0",
                // 右列の上ボーダーはモバイル分を維持するため調整不要
              ].join(" ")}
            >
              {/* 番号 */}
              <p
                className="font-v2-mono text-xs"
                style={{
                  color: "var(--color-v2-text-subtle)",
                  fontFamily: "var(--font-v2-mono)",
                }}
              >
                {card.num}
              </p>

              {/* 見出し */}
              <h4
                className="mt-2 font-bold text-lg md:text-xl"
                style={{
                  color: "var(--color-v2-text)",
                  fontFamily: "var(--font-v2-display)",
                }}
              >
                {card.heading}
              </h4>

              {/* 本文 */}
              <p
                className="mt-3 text-sm leading-relaxed"
                style={{
                  color: "var(--color-v2-text-body)",
                  fontFamily: "var(--font-v2-sans)",
                }}
              >
                {card.body}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
