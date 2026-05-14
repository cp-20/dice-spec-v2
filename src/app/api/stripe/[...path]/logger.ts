import { runtimeEnv } from '@/shared/lib/env';

type StripeLogLevel = 'info' | 'success' | 'error' | 'warning';

type StripeLog = {
  level: StripeLogLevel;
  eventType: string;
  message: string;
  userId?: string;
  details?: Record<string, unknown>;
  error?: Error | unknown;
};

const DISCORD_MAX_FIELDS = 25;
const DISCORD_MAX_FIELD_NAME_LENGTH = 256;
const DISCORD_MAX_FIELD_VALUE_LENGTH = 1024;
const MAX_ERROR_MESSAGE_LENGTH = 240;

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

const truncate = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 3))}...`;
};

const formatDetailValue = (value: unknown): string => {
  if (value === undefined) {
    return 'undefined';
  }

  if (value === null) {
    return 'null';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    return truncate(value, DISCORD_MAX_FIELD_VALUE_LENGTH);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  try {
    return truncate(JSON.stringify(value), DISCORD_MAX_FIELD_VALUE_LENGTH);
  } catch {
    return truncate(String(value), DISCORD_MAX_FIELD_VALUE_LENGTH);
  }
};

const formatFieldName = (name: string): string => {
  return truncate(name.replaceAll('_', ' '), DISCORD_MAX_FIELD_NAME_LENGTH);
};

const getErrorSummary = (error: Error | unknown): Record<string, unknown> => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: truncate(error.message, MAX_ERROR_MESSAGE_LENGTH),
    };
  }

  return {
    type: typeof error,
    message: truncate(formatDetailValue(error), MAX_ERROR_MESSAGE_LENGTH),
  };
};

const buildDiscordFields = (log: StripeLog): { name: string; value: string; inline?: boolean }[] => {
  const fields: { name: string; value: string; inline?: boolean }[] = [
    {
      name: 'Event Type',
      value: `\`${formatDetailValue(log.eventType)}\``,
      inline: true,
    },
  ];

  if (log.userId) {
    fields.push({
      name: 'User ID',
      value: `\`${formatDetailValue(log.userId)}\``,
      inline: true,
    });
  }

  if (log.details) {
    for (const [key, value] of Object.entries(log.details)) {
      if (fields.length >= DISCORD_MAX_FIELDS) {
        break;
      }

      const valueText = formatDetailValue(value);
      fields.push({
        name: formatFieldName(key),
        value: `\`${valueText}\``,
        inline: valueText.length <= 48,
      });
    }
  }

  if (log.error && fields.length < DISCORD_MAX_FIELDS) {
    fields.push({
      name: 'Error',
      value: `\`${formatDetailValue(getErrorSummary(log.error))}\``,
      inline: false,
    });
  }

  return fields;
};

/**
 * never throw error from this function to avoid blocking the main process. Log any error internally instead.
 */
export const sendStripeLog = async (log: StripeLog) => {
  const consolePayload = {
    eventType: log.eventType,
    message: log.message,
    userId: log.userId,
    details: log.details,
    error: log.error ? getErrorSummary(log.error) : undefined,
  };

  console.log(`[Stripe][${log.level}]`, consolePayload);

  // Don't send info level logs to Discord to avoid noise, but still log them in the console
  if (log.level === 'info') return;

  const fields = buildDiscordFields(log);

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
    const res = await fetch(runtimeEnv.stripe.discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to send Discord webhook:', truncate(errorText, 500));
    }
  } catch (error) {
    // Don't throw error to avoid blocking the main process
    console.error('Failed to send Discord webhook:', error);
  }
};
