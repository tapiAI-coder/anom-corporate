// 会社概要データ
// TODO: 法人化完了後に法人名・設立日等を更新
export const companyInfo = [
  { label: "会社名", value: "ANOM（アノム）" },
  { label: "代表者", value: "菊地 隆雅" },
  { label: "所在地", value: "秋田県" },
  { label: "設立", value: "2026年" },
  {
    label: "事業内容",
    value:
      "DX・AIコンサルティング / アドバイザリー / 業務フロー改善 / AI導入支援 / ツール選定・導入後サポート",
  },
  { label: "メール", value: "info@anom-ai.com" },
  { label: "Webサイト", value: "https://anom-ai.com", isLink: true },
] as const;
