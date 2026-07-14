export const ALL_CHARACTER_ID = 'all';
export const ALL_CHARACTER_NAME = '[ALL]';

export type System = 'emoklore' | 'CoC7th' | 'CoC6th' | 'shinobigami' | 'nechronica';

export type SystemMessageParserResult = {
  evaluation: string;
  results: number[];
  target: number;
  skillName: string | null;
};

export type SystemMessageParser = (message: string) => SystemMessageParserResult | null;

export type MessageParserResult = SystemMessageParserResult & {
  evaluationStatus: 'success' | 'failure' | 'other';
};

export type SystemStats = {
  average: number;
  variance: number;
  better: 'low' | 'high';
  pivots: number[];
  evaluations: Array<{ label: string; status: 'success' | 'failure' | 'other' }>;
};

export type DiceResultSummary = {
  successRate: number;
  average: number;
  diceRollCount: number;
  diceCount: number;
  deviationScore: number;
};

export type DiceResultForCharacter = {
  id: string;
  name: string;
  results: Array<MessageParserResult & { fullStr: string }>;
  summary: DiceResultSummary;
};
