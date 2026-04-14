// 料金データ

export interface PricingPlan {
  name: string;
  nameEn: string;
  price: string;
  unit: string;
  description: string;
  features: string[];
  recommended: boolean;
}

export interface FAQ {
  question: string;
  answer: string;
}

export const plans: PricingPlan[] = [
  {
    name: "ライトプラン",
    nameEn: "Light",
    price: "5万円",
    unit: "月額（税抜）",
    description:
      "まずは相談から始めたい方に。月1回の定例ミーティングで、DX・AI活用の方向性を一緒に考えます。",
    features: [
      "月1回の定例ミーティング（60分）",
      "チャットサポート（営業時間内）",
      "DX・AI活用のアドバイス",
      "簡易レポート作成",
    ],
    recommended: false,
  },
  {
    name: "スタンダードプラン",
    nameEn: "Standard",
    price: "10〜20万円",
    unit: "月額（税抜）",
    description:
      "本格的にDXを推進したい方に。月2回のミーティングに加え、業務改善の実行支援まで伴走します。",
    features: [
      "月2回の定例ミーティング（60分）",
      "チャットサポート（優先対応）",
      "業務フロー分析・改善提案",
      "ツール選定・導入サポート",
      "月次レポート作成",
      "現場スタッフ向け説明支援",
    ],
    recommended: true,
  },
  {
    name: "プロジェクト型",
    nameEn: "Project",
    price: "30万円〜",
    unit: "プロジェクト単位（税抜）",
    description:
      "特定の課題を集中的に解決したい方に。期間と範囲を明確にし、成果物ベースで支援します。",
    features: [
      "課題ヒアリング・要件定義",
      "ソリューション設計・提案",
      "導入・初期運用支援",
      "3ヶ月間のフォローアップ付き",
      "現場向けマニュアル作成",
      "KPI設計・効果測定",
    ],
    recommended: false,
  },
];

export const faqs: FAQ[] = [
  {
    question: "契約期間に縛りはありますか？",
    answer:
      "月額プランは3ヶ月からの契約をお願いしていますが、その後はいつでも解約可能です。まずは3ヶ月で効果を実感していただき、継続をご判断ください。",
  },
  {
    question: "秋田県外の企業でも依頼できますか？",
    answer:
      "はい、オンラインでの支援も対応しています。ただし、現地訪問が必要な場合は別途交通費をいただく場合があります。",
  },
  {
    question: "ITやAIの知識がなくても大丈夫ですか？",
    answer:
      "もちろんです。専門用語を使わず、わかりやすい言葉で説明します。「何から始めればいいかわからない」という段階からサポートしますのでご安心ください。",
  },
  {
    question: "具体的にどんな成果が出ますか？",
    answer:
      "業種や課題によりますが、定型業務の工数削減（月20〜40時間の削減実績あり）、ペーパーレス化による管理コストの低減、データ活用による意思決定の迅速化などが見込めます。",
  },
  {
    question: "まずは相談だけでも可能ですか？",
    answer:
      "初回のご相談は無料です。現状の課題やお悩みをお聞かせください。その上で最適なプランをご提案します。お気軽にお問い合わせください。",
  },
];
