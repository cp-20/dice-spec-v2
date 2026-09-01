import { after } from 'next/server';

import { runtimeEnv } from '@/shared/lib/env';

type StripeLogLevel = 'info' | 'success' | 'error' | 'warning';

type StripeLog = {
  level: StripeLogLevel;
  eventType: string;
  message: string;
  notify?: boolean;
  userId?: string;
  details?: Record<string, unknown>;
  error?: Error | unknown;
};

const DISCORD_MAX_CONTENT_LENGTH = 2000;
const DISCORD_MAX_TITLE_LENGTH = 256;
const DISCORD_MAX_DESCRIPTION_LENGTH = 4096;
const MAX_ERROR_MESSAGE_LENGTH = 240;
const STRIPE_ZERO_DECIMAL_CURRENCIES = new Set([
  'BIF',
  'CLP',
  'DJF',
  'GNF',
  'JPY',
  'KMF',
  'KRW',
  'MGA',
  'PYG',
  'RWF',
  'VND',
  'VUV',
  'XAF',
  'XOF',
  'XPF',
]);

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

const stringifyJson = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? JSON.stringify({ serializationError: 'undefined' });
  } catch {
    return JSON.stringify({ serializationError: String(value) });
  }
};

const getErrorSummary = (error: Error | unknown): Record<string, unknown> => {
  if (error instanceof Error) {
    return {
      name: truncate(error.name, MAX_ERROR_MESSAGE_LENGTH),
      message: truncate(error.message, MAX_ERROR_MESSAGE_LENGTH),
    };
  }

  return {
    type: typeof error,
    message: truncate(
      typeof error === 'object' && error !== null ? stringifyJson(error) : String(error),
      MAX_ERROR_MESSAGE_LENGTH,
    ),
  };
};

const formatAmount = (amount: number, currency: string | null): string => {
  if (!currency) return `${amount}（最小通貨単位）`;

  try {
    const normalizedCurrency = currency.toUpperCase();
    const formatter = new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: normalizedCurrency,
      currencyDisplay: 'code',
    });
    // ISK と UGX は zero-decimal 通貨だが、Stripe API では後方互換性のため2桁で表す。
    const fractionDigits = STRIPE_ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency) ? 0 : 2;
    return formatter.format(amount / 10 ** fractionDigits);
  } catch {
    return `${amount} ${currency}（最小通貨単位）`;
  }
};

const buildAuditContent = (log: StripeLog, timestamp: string): string => {
  const payload = {
    timestamp,
    level: log.level,
    eventType: truncate(log.eventType, 160),
    message: truncate(log.message, 320),
    userId: log.userId ? truncate(log.userId, 160) : undefined,
    details: log.details,
    error: log.error ? getErrorSummary(log.error) : undefined,
  };
  const maxJsonLength = DISCORD_MAX_CONTENT_LENGTH - 2;
  let json = stringifyJson(payload).replaceAll('`', '\\u0060');

  if (json.length > maxJsonLength) {
    json = stringifyJson({
      ...payload,
      details: log.details ? truncate(stringifyJson(log.details), 600) : undefined,
      truncated: true,
    }).replaceAll('`', '\\u0060');
  }

  if (json.length > maxJsonLength) {
    json = stringifyJson({
      timestamp,
      level: log.level,
      eventType: truncate(log.eventType, 80),
      message: truncate(log.message, 160),
      details: 'Discord の文字数制限により省略',
      truncated: true,
    }).replaceAll('`', '\\u0060');
  }

  return `\`${json}\``;
};

const readDetail = (details: Record<string, unknown> | undefined, key: string): string | null => {
  const value = details?.[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
};

const buildNotificationDescription = (log: StripeLog): string => {
  const details = log.details;
  const lines = [`イベント: \`${truncate(log.eventType, 160)}\``];

  if (log.userId) lines.push(`ユーザー: \`${truncate(log.userId, 160)}\``);

  const billingInterval = readDetail(details, 'billingInterval');
  if (billingInterval) lines.push(`契約間隔: \`${billingInterval}\``);

  const amount = details?.amountPaid ?? details?.amountDue ?? details?.amountTotal;
  const currency = readDetail(details, 'currency');
  if (typeof amount === 'number') lines.push(`金額: \`${formatAmount(amount, currency)}\``);

  const cancelAt = readDetail(details, 'cancelAt');
  if (cancelAt) lines.push(`終了予定: \`${cancelAt}\``);

  const nextPaymentAttempt = readDetail(details, 'nextPaymentAttempt');
  if (nextPaymentAttempt) lines.push(`次回決済試行: \`${nextPaymentAttempt}\``);

  const failureMessage = readDetail(details, 'failureMessage');
  if (failureMessage) lines.push(`理由: ${truncate(failureMessage, 500)}`);

  const hostedInvoiceUrl = readDetail(details, 'hostedInvoiceUrl');
  if (hostedInvoiceUrl) lines.push(`[請求書を開く](${hostedInvoiceUrl})`);

  if (log.error) {
    const error = getErrorSummary(log.error);
    lines.push(`エラー: \`${truncate(String(error.message), MAX_ERROR_MESSAGE_LENGTH)}\``);
  }

  return truncate(lines.join('\n'), DISCORD_MAX_DESCRIPTION_LENGTH);
};

const postDiscordWebhook = async (
  getUrl: () => string,
  body: Record<string, unknown>,
  destination: 'audit' | 'notification',
) => {
  try {
    const res = await fetch(getUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to send Stripe ${destination} log:`, truncate(errorText, 500));
    }
  } catch (error) {
    console.error(`Failed to send Stripe ${destination} log:`, error);
  }
};

/**
 * ログ送信の失敗で Stripe の処理を止めない。
 */
export const sendStripeLog = async (log: StripeLog) => {
  const timestamp = new Date().toISOString();
  const consolePayload = {
    eventType: log.eventType,
    message: log.message,
    userId: log.userId,
    details: log.details,
    error: log.error ? getErrorSummary(log.error) : undefined,
  };

  console.log(`[Stripe][${log.level}]`, consolePayload);

  const requests = [
    postDiscordWebhook(
      () => runtimeEnv.stripe.auditDiscordWebhookUrl,
      { content: buildAuditContent(log, timestamp) },
      'audit',
    ),
  ];

  if (log.notify || log.level === 'error') {
    requests.push(
      postDiscordWebhook(
        () => runtimeEnv.stripe.discordWebhookUrl,
        {
          embeds: [
            {
              title: truncate(`${getLevelEmoji(log.level)} ${log.message}`, DISCORD_MAX_TITLE_LENGTH),
              description: buildNotificationDescription(log),
              color: getLevelColor(log.level),
              timestamp,
            },
          ],
        },
        'notification',
      ),
    );
  }

  await Promise.all(requests);
};

export const scheduleStripeLog = (...params: Parameters<typeof sendStripeLog>) => {
  after(async () => {
    await sendStripeLog(...params);
  });
};
