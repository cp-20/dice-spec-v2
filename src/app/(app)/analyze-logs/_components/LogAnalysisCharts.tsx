'use client';

import { IconBrandX, IconLoader } from '@tabler/icons-react';
import type { Plugin } from 'chart.js';
import merge from 'deepmerge';
import dynamic from 'next/dynamic';
import { type FC, useEffect } from 'react';
import type { withNumberDiceResult } from './hooks/ccfoliaLogAnalysis/diceResultAnalyzer';
import { useCharacterLogAnalysis } from './hooks/useCharacterLogAnalysis';
import { useCharacterSelect } from './hooks/useCharacterSelect';
import { useChartImageShare } from './hooks/useChartImageShare';
import { Button } from '@/shared/components/ui/button';
import { commonChartOption } from '@/shared/lib/commonChartOption';
import { groupBy } from '@/shared/lib/groupBy';

const customCanvasBackgroundColorPlugin: Plugin = {
  id: 'customCanvasBackgroundColor',
  beforeDraw: (chart, args, options) => {
    const { ctx } = chart;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = (options.color as string) || '#ffffff';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};

const Bar = dynamic(
  async () =>
    (await import('@/shared/components/elements/RefForwardedBarChart'))
      .RefForwardedBarChart,
  {
    ssr: false,
  },
);

export const LogAnalysisCharts: FC = () => {
  const { chartRef, isSharingInProgress, shareImage } = useChartImageShare();
  const { character } = useCharacterSelect();
  const result = useCharacterLogAnalysis(character);

  useEffect(() => {
    import('chart.js').then(
      ({ Chart, BarController, CategoryScale, LinearScale, BarElement }) => {
        Chart.register(
          BarController,
          CategoryScale,
          LinearScale,
          BarElement,
          customCanvasBackgroundColorPlugin,
        );
      },
    );
  }, []);

  if (!result) {
    return null;
  }

  const withNumberDiceResults = result.diceResults.filter(
    ({ diceResultNumber }) => diceResultNumber !== undefined,
  ) as withNumberDiceResult[];
  const diceResultNumber = withNumberDiceResults.map(
    ({ diceResultNumber }) => diceResultNumber,
  );
  const aggregatedDiceResultNumber = Object.values(
    groupBy(diceResultNumber, (result) => Math.floor((result - 1) / 10)),
  ).map((results) => (results ? results.length : 0));
  const diceResultNumberLabels = [...Array(10)].map(
    (_, i) => `${i * 10 + 1}-${i * 10 + 10}`,
  );

  const diceResult = withNumberDiceResults.map(({ diceResult }) => diceResult);
  const aggregatedDiceResult = Object.entries(
    groupBy(diceResult, (result) => result),
  )
    .map(([result, results]) => [result, results ? results.length : 0] as const)
    .toSorted(([, a], [, b]) => b - a);
  const aggregatedDiceResultLabels = aggregatedDiceResult.map(
    ([result]) => result,
  );
  const aggregatedDiceResultData = aggregatedDiceResult.map(
    ([, value]) => value,
  );

  return (
    <div className="space-y-4 @container">
      <Button
        variant="secondary"
        className="w-full"
        onClick={shareImage}
        disabled={isSharingInProgress}
      >
        {isSharingInProgress ? (
          <div className="animate-slide-in-top" key="sharing-in-progress">
            <IconLoader className="animate-spin" />
          </div>
        ) : (
          <div className="flex animate-slide-in-top gap-2" key="share-button">
            <IconBrandX />
            <span>解析結果をシェア</span>
          </div>
        )}
      </Button>
      <div className="flex flex-col gap-8 @xl:flex-row">
        <div className="fixed left-full">
          <Bar
            data={{
              labels: diceResultNumberLabels,
              datasets: [
                {
                  data: aggregatedDiceResultNumber,
                  backgroundColor: 'rgba(100, 116, 139, 0.5)',
                  yAxisID: 'y',
                },
              ],
            }}
            height={630}
            width={1200}
            options={merge(commonChartOption, {
              scales: {
                x: { ticks: { font: { size: 30 } } },
                y: { ticks: { font: { size: 30 } } },
              },
              layout: {
                padding: 32,
              },
            } as const)}
            forwardedRef={chartRef}
          />
        </div>
        <div className="min-w-0 flex-1">
          <Bar
            data={{
              labels: diceResultNumberLabels,
              datasets: [
                {
                  data: aggregatedDiceResultNumber,
                  backgroundColor: 'rgba(100, 116, 139, 0.5)',
                  yAxisID: 'y',
                },
              ],
            }}
            height={300}
            options={commonChartOption}
          />
        </div>
        <div className="min-w-0 flex-1">
          <Bar
            data={{
              labels: aggregatedDiceResultLabels,
              datasets: [
                {
                  data: aggregatedDiceResultData,
                  backgroundColor: 'rgba(100, 116, 139, 0.5)',
                },
              ],
            }}
            height={300}
            options={merge(commonChartOption, {
              indexAxis: 'y',
            } as const)}
          />
        </div>
      </div>
    </div>
  );
};
