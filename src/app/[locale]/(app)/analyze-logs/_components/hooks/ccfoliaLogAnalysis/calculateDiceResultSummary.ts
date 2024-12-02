import type { DiceResult } from './diceResultAnalyzer';

export type DiceResultSummary = {
  successRate: number;
  average: number;
  diceRollCount: number;
  deviationScore: number;
};

export const calculateDiceResultSummary = (diceResults: DiceResult[]) => {
  const successRate = (diceResults.filter(({ success }) => success).length / diceResults.length) * 100;

  const withNumberDices = diceResults
    .filter(({ diceResultNumber }) => diceResultNumber !== undefined)
    .map(({ diceResultNumber }) => diceResultNumber!);

  const average = withNumberDices.reduce((acc, number) => acc + number, 0) / withNumberDices.length;

  const diceRollCount = diceResults.length;

  const SD =
    Math.sqrt(withNumberDices.reduce((acc, number) => acc + (number - average) ** 2, 0) / withNumberDices.length) /
    Math.sqrt(diceRollCount);

  const deviationScore = (-(average - 50.5) * 10) / SD + 50;

  return { successRate, average, deviationScore, diceRollCount };
};
