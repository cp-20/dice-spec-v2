import type { SystemMessageParser, SystemStats } from '.';
import { normalizeParentheses } from './normalize';
import { extractSkillNameFromMessage } from './skillName';

// match[1]: ダイス結果
// match[2]: 評価
const nechronicaRegex =
  /\((?:(?:\d*)N[CA][+-]?\d*|(?:\d*)R10(?:[+-]\d+)*(?:\[[01]\])?)\) [＞→] \[([0-9,、 ]+)\](?:[+-]\d+)* [＞→] -?\d+\[[0-9,、 -]+\] [＞→] (大成功|成功|失敗|大失敗)(?: [＞→] .+)?$/;

export const nechronicaParser: SystemMessageParser = (message) => {
  const normalizedMessage = normalizeParentheses(message);
  const match = normalizedMessage.match(nechronicaRegex);
  if (match === null) return null;

  const results = match[1].split(/[、,]\s*/u).map((result) => Number.parseInt(result, 10));
  const evaluation = match[2];
  const skillName = extractSkillNameFromMessage(normalizedMessage);

  return {
    evaluation,
    results,
    target: 6,
    skillName,
  };
};

export const nechronicaSystemStats = {
  average: 5.5,
  variance: 8.25,
  better: 'high',
  pivots: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  evaluations: [
    { label: '大失敗', status: 'failure' },
    { label: '失敗', status: 'failure' },
    { label: '成功', status: 'success' },
    { label: '大成功', status: 'success' },
  ],
} satisfies SystemStats;
