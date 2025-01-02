import {
  analyzeCcfoliaLog,
  type DiceResultForCharacter,
} from '@/app/[locale]/(app)/analyze-logs/_components/hooks/ccfoliaLogAnalysis';

const template = (main: string) =>
  `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>ccfolia - logs</title>
  </head>
  <body>
    


${main}

  </body>
</html>`;

type TestCase = {
  name: string;
  input: string;
  expected: DiceResultForCharacter[];
};

describe('analyzeCcfoliaLog', () => {
  const tests: TestCase[] = [
    {
      name: 'no match',
      input: template(`<p style="color:#888888;">
  <span> [メイン]</span>
  <span>キャラクターA</span> :
  <span>
    こんにちは 
  </span>
</p>`),
      expected: [
        {
          id: 'all',
          name: '[ALL]',
          results: [],
          summary: {
            average: expect.any(Number),
            deviationScore: expect.any(Number),
            diceRollCount: 0,
            successRate: expect.any(Number),
          },
        },
      ],
    },
    {
      name: 'success',
      input: template(`<p style="color:#888888;">
  <span> [メイン]</span>
  <span>キャラクターA</span> :
  <span>
    1d100&lt;=30 【なんか】 (1D100&lt;=30) ＞ 19 ＞ 成功
  </span>
</p>`),
      expected: [
        {
          id: 'all',
          name: '[ALL]',
          results: [
            {
              fullStr: '[メイン] 1d100<=30 【なんか】 (1D100<=30) ＞ 19 ＞ 成功',
              evaluation: '成功',
              evaluationStatus: 'success',
              result: 19,
              target: 30,
            },
          ],
          summary: {
            average: 19,
            deviationScore: expect.any(Number),
            diceRollCount: 1,
            successRate: 100,
          },
        },
        {
          id: 'character-キャラクターA',
          name: 'キャラクターA',
          results: [
            {
              fullStr: '[メイン] 1d100<=30 【なんか】 (1D100<=30) ＞ 19 ＞ 成功',
              evaluation: '成功',
              evaluationStatus: 'success',
              result: 19,
              target: 30,
            },
          ],
          summary: {
            average: 19,
            deviationScore: expect.any(Number),
            diceRollCount: 1,
            successRate: 100,
          },
        },
      ],
    },
    {
      name: 'failure',
      input: template(`<p style="color:#888888;">
  <span> [メイン]</span>
  <span>キャラクターA</span> :
  <span>
    1d100&lt;=30 【なんか】 (1D100&lt;=30) ＞ 51 ＞ 失敗
  </span>
</p>`),
      expected: [
        {
          id: 'all',
          name: '[ALL]',
          results: [
            {
              fullStr: '[メイン] 1d100<=30 【なんか】 (1D100<=30) ＞ 51 ＞ 失敗',
              evaluation: '失敗',
              evaluationStatus: 'failure',
              result: 51,
              target: 30,
            },
          ],
          summary: {
            average: 51,
            deviationScore: expect.any(Number),
            diceRollCount: 1,
            successRate: 0,
          },
        },
        {
          id: 'character-キャラクターA',
          name: 'キャラクターA',
          results: [
            {
              fullStr: '[メイン] 1d100<=30 【なんか】 (1D100<=30) ＞ 51 ＞ 失敗',
              evaluation: '失敗',
              evaluationStatus: 'failure',
              result: 51,
              target: 30,
            },
          ],
          summary: {
            average: 51,
            deviationScore: expect.any(Number),
            diceRollCount: 1,
            successRate: 0,
          },
        },
      ],
    },
  ];

  for (const t of tests) {
    it(t.name, () => {
      expect(analyzeCcfoliaLog(t.input)).toEqual(t.expected);
    });
  }
});
