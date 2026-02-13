const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL as string;

type StripeLogLevel = 'info' | 'success' | 'error' | 'warning';

type StripeLog = {
  level: StripeLogLevel;
  eventType: string;
  message: string;
  userId?: string;
  details?: Record<string, unknown>;
  error?: Error | unknown;
};

const getLevelColor = (level: StripeLogLevel): number => {
  switch (level) {
    case 'success':
      return 0x28a745; // Green
    case 'error':
      return 0xdc3545; // Red
    case 'warning':
      return 0xffc107; // Yellow
    case 'info':
      return 0x007bff; // Blue
    default: {
      const _: never = level;
      return 0x6c757d; // Gray
    }
  }
};

const getLevelEmoji = (level: StripeLogLevel): string => {
  switch (level) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    default: {
      const _: never = level;
      return '';
    }
  }
};

export const sendStripeLog = async (log: StripeLog) => {
  if (log.level === 'info') {
    console.log('[Stripe][info]', {
      eventType: log.eventType,
      message: log.message,
      userId: log.userId,
      details: log.details,
      error: log.error,
    });
    return;
  }

  const fields: { name: string; value: string; inline?: boolean }[] = [
    {
      name: 'Event Type',
      value: `\`${log.eventType}\``,
      inline: true,
    },
  ];

  if (log.userId) {
    fields.push({
      name: 'User ID',
      value: `\`${log.userId}\``,
      inline: true,
    });
  }

  if (log.details) {
    for (const [key, value] of Object.entries(log.details)) {
      const valueStr = `${JSON.stringify(value)}`;
      const inline = valueStr.length < 32;
      fields.push({
        name: key,
        value: inline ? `\`${valueStr}\`` : `\`\`\`${valueStr}\`\`\``,
        inline,
      });
    }
  }

  if (log.error) {
    const errorMessage = log.error instanceof Error ? log.error.message : JSON.stringify(log.error);
    const errorStack = log.error instanceof Error ? log.error.stack : undefined;
    fields.push({
      name: 'Error',
      value: `\`\`\`${errorMessage}\`\`\``,
    });
    if (errorStack) {
      fields.push({
        name: 'Stack Trace',
        value: `\`\`\`${errorStack.slice(0, 1000)}\`\`\``,
      });
    }
  }

  const body = {
    embeds: [
      {
        title: `${getLevelEmoji(log.level)} Stripe ${log.level.toUpperCase()}: ${log.message}`,
        color: getLevelColor(log.level),
        fields,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error('Failed to send Discord webhook:', await res.text());
    }
  } catch (error) {
    // Don't throw error to avoid blocking the main process
    console.error('Failed to send Discord webhook:', error);
  }
};
