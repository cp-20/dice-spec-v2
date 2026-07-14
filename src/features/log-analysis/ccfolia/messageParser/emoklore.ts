import type { SystemMessageParser, SystemStats } from '@/features/log-analysis/model';

import { normalizeParentheses } from './normalize';
import { extractSkillNameFromMessage } from './skillName';

// match[1]: 振ったダイスの数
// match[2]: 目標値
// match[3]: ダイス結果
// match[4]: 成功数
// match[5]: 評価
const emokloreRegex = /\((\d+)DM<=(\d+)\) ＞ \[([0-9, ]+)\] ＞ (-?[0-9]+) ＞ (?:成功数(?:-?[0-9]+) )?(.+?)!?$/;

export const emokloreParser: SystemMessageParser = (message) => {
  const normalizedMessage = normalizeParentheses(message);
  const match = normalizedMessage.match(emokloreRegex);
  if (match === null) return null;

  const target = Number.parseInt(match[2], 10);
  const results = match[3].split(', ').map((result) => Number.parseInt(result, 10));
  const evaluation = match[5];
  const skillName = extractSkillNameFromMessage(normalizedMessage);

  return {
    evaluation,
    results,
    target,
    skillName,
  };
};

export const emokloreSystemStats = {
  average: 5.5,
  variance: 8.25,
  better: 'low',
  pivots: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  evaluations: [
    { label: 'ファンブル', status: 'failure' },
    { label: '失敗', status: 'failure' },
    { label: '成功', status: 'success' },
    { label: 'ダブル', status: 'success' },
    { label: 'トリプル', status: 'success' },
    { label: 'ミラクル', status: 'success' },
    { label: 'カタストロフ', status: 'success' },
  ],
} satisfies SystemStats;
