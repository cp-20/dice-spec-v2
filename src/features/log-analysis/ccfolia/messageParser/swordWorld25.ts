import type { SystemMessageParser, SystemStats } from '@/features/log-analysis/model';

import { normalizeParentheses } from './normalize';
import { extractSkillNameFromMessage } from './skillName';

const EVALUATIONS = ['自動的失敗', '失敗', '成功', '自動的成功'] as const;

const parseDicePairs = (segment: string): number[] =>
  Array.from(
    segment.matchAll(/\[([1-6]),([1-6])\]/gu),
    ([, left, right]) => Number.parseInt(left, 10) + Number.parseInt(right, 10),
  );

const parseRatingDicePairs = (segment: string): number[] => {
  const diceList = segment.match(/^2D:\[([^\]]+)\]/u)?.[1];
  if (diceList === undefined) return [];

  return Array.from(
    diceList.matchAll(/([1-6]),([1-6])/gu),
    ([, left, right]) => Number.parseInt(left, 10) + Number.parseInt(right, 10),
  );
};

const parseEvaluation = (segments: string[]): string => {
  const lastSegment = segments.at(-1)?.trim();
  return EVALUATIONS.find((evaluation) => evaluation === lastSegment) ?? '';
};

const parseTarget = (commandSegment: string): number => {
  const match = commandSegment.match(/(?:>=|<=|>|<)(-?\d+)\)\s*$/u);
  return match === null ? -1 : Number.parseInt(match[1], 10);
};

const parseRatingMessage: SystemMessageParser = (message) => {
  const segments = message.split(/\s*＞\s*/u);
  const commandSegmentIndex = segments.findIndex((segment) => segment.includes('KeyNo.'));
  if (commandSegmentIndex === -1) return null;

  const commandSegment = segments[commandSegmentIndex];
  const resultSegment = segments[commandSegmentIndex + 1];
  if (resultSegment === undefined || !resultSegment.startsWith('2D:[')) return null;

  const results = parseRatingDicePairs(resultSegment);
  if (results.length === 0) return null;

  const outputMarkerIndex = commandSegment.indexOf('KeyNo.');
  const command = commandSegment.slice(0, outputMarkerIndex).trim();

  return {
    // 威力表の「自動的失敗」は行為判定の失敗ではないため、成功率に含めない。
    evaluation: '',
    results,
    target: -1,
    skillName: command === '' ? null : extractSkillNameFromMessage(command),
  };
};

const parseCheckMessage: SystemMessageParser = (message) => {
  const segments = message.split(/\s*＞\s*/u);
  const commandSegmentIndex = segments.findIndex((segment) => segment.includes('(2D6'));
  if (commandSegmentIndex === -1) return null;

  const commandSegment = segments[commandSegmentIndex];
  const resultSegment = segments[commandSegmentIndex + 1];
  if (resultSegment === undefined) return null;

  const results = parseDicePairs(resultSegment);
  if (results.length === 0) return null;

  return {
    evaluation: parseEvaluation(segments),
    results,
    target: parseTarget(commandSegment),
    skillName: extractSkillNameFromMessage(commandSegment),
  };
};

export const swordWorld25Parser: SystemMessageParser = (message) => {
  const normalizedMessage = normalizeParentheses(message);
  return parseRatingMessage(normalizedMessage) ?? parseCheckMessage(normalizedMessage);
};

// 通常の2D6は他システムでも使われる。自動検出ではSW2.5固有の威力表出力だけを根拠にする。
export const isSwordWorld25Message = (message: string): boolean =>
  parseRatingMessage(normalizeParentheses(message)) !== null;

export const swordWorld25SystemStats = {
  average: 7,
  variance: 35 / 6,
  better: 'high',
  pivots: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  evaluations: [
    { label: '自動的失敗', status: 'failure' },
    { label: '失敗', status: 'failure' },
    { label: '成功', status: 'success' },
    { label: '自動的成功', status: 'success' },
  ],
} satisfies SystemStats;
