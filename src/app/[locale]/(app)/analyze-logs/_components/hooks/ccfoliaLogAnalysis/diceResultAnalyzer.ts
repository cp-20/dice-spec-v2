import type { ParsedLog } from '.';

export type DiceResult = {
  success: boolean;
  failure: boolean;
  diceFullStr: string;
  diceResultNumber: number | undefined;
  diceResult: string;
  diceTarget: number;
};

export type withNumberDiceResult = {
  success: boolean;
  failure: boolean;
  diceFullStr: string;
  diceResultNumber: number;
  diceResult: string;
  diceTarget: number;
};

const successPattern = [
  '成功',
  '決定的成功/スペシャル',
  'スペシャル',
  'クリティカル',
  'レギュラー成功',
  'ハード成功',
  'イクストリーム成功',
];

const failurePattern = ['失敗', '致命的失敗/ファンブル', '致命的失敗', 'ファンブル'];

export const analyzeDiceResult = ({ result, tab }: ParsedLog): DiceResult => {
  const diceFullStr = `${tab} ${result.message}`;

  const success = successPattern.includes(result.diceResult);
  const failure = failurePattern.includes(result.diceResult);

  return {
    success,
    failure,
    diceFullStr,
    ...result,
  };
};
