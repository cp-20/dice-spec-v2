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
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to send feedback');
  }
};
