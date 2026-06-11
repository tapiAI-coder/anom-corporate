// UserPromptSubmit hook — デザイン関連キーワードを検出したら、
// ui-ux-pro-max と framer-motion-animator スキルの起動をリマインド
let data = '';
process.stdin.on('data', (c) => (data += c));
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(data);
    const prompt = payload.prompt || '';
    // デザイン関連キーワード（日本語・英語）
    const regex = /デザイン|design|アニメーション|animation|配色|レイアウト|layout|モーション|motion|視認性|アクセシビリティ|accessibility|余白|フォント|font|スタイル|style|色|カラー|color|UI\/UX|UIデザイン|UXデザイン|ホバー|hover|トランジション|transition|装飾/i;
    if (regex.test(prompt)) {
      const reminder = [
        '【デザイン関連のリマインダー】',
        'このプロンプトはデザイン/UI/UX/アニメーション関連です。',
        '作業開始前に、必ず以下2つのスキルを Skill ツールで起動してから着手してください:',
        '  1. ui-ux-pro-max — UI/UXデザイン判断・配色・レイアウト・スタイル適用',
        '  2. framer-motion-animator — アニメーション・モーション実装',
        '',
        '両スキルの呼び出しを省略しないこと。ユーザーの明示指示です。',
      ].join('\n');
      process.stdout.write(
        JSON.stringify({
          hookSpecificOutput: {
            hookEventName: 'UserPromptSubmit',
            additionalContext: reminder,
          },
        })
      );
    }
  } catch (e) {
    // JSON parseエラー等は黙って無視（hookが本体作業をブロックしないため）
  }
});
