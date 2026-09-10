import * as v from 'valibot';

import { logTab, type StructuredLog } from './structuredLog';

const logSchema = v.object({
  messages: v.array(
    v.object({
      name: v.string(),
      color: v.string(),
      text: v.string(),
      type: v.picklist(['text', 'note', 'system']),
      channel: v.string(),
      channelName: v.string(),
      createdAt: v.pipe(v.number(), v.finite()),
      extend: v.object({ roll: v.optional(v.object({ result: v.string() })) }),
    }),
  ),
});

export const parseJsonLog = (content: string): StructuredLog[] => {
  const result = v.safeParse(logSchema, JSON.parse(content));
  if (!result.success) throw new Error('Invalid log format');
  return result.output.messages.map((message) => ({
    character: message.name || 'noname',
    color: message.color,
    tab: logTab(message.channel, message.channelName),
    channel: message.channel,
    // 公式例は秒、実際の出力はミリ秒のため、双方を同じ単位にそろえる。
    createdAt: message.createdAt < 1e12 ? message.createdAt * 1000 : message.createdAt,
    message: [message.text, message.extend.roll?.result].filter(Boolean).join(' ').trim(),
  }));
};
