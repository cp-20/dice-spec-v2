const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL as string;

type Feedback = {
  name?: string;
  feedback: string;
};

export const sendFeedback = async (feedback: Feedback) => {
  const body = {
    content: 'フィードバックが届きました',
    embeds: [
      {
        title: 'フィードバック',
        description: feedback.feedback,
        fields: [
          {
            name: '名前',
            value: feedback.name || '未入力',
          },
        ],
      },
    ],
  };
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error('Failed to send feedback');
  }
};

type GameSystemRequest = {
  system: string;
  logFile: File | null;
};

export const sendGameSystemRequest = async (request: GameSystemRequest) => {
  const payload = {
    content: '他ゲームシステム対応リクエストが届きました (ログ分析)',
    embeds: [
      {
        title: 'ログ分析: 他ゲームシステム対応リクエスト',
        fields: [
          {
            name: 'ゲームシステム名',
            value: request.system,
          },
        ],
      },
    ],
  };

  const formData = new FormData();
  formData.append('payload_json', JSON.stringify(payload));
  if (request.logFile) formData.append('files[0]', request.logFile);

  const res = await fetch(webhookUrl, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Failed to send game system request');
  }
};
