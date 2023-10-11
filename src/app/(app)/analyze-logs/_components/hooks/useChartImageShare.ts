import { useCallback, useRef, useState } from 'react';
import type { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';
import { useCharacterLogAnalysis } from './useCharacterLogAnalysis';
import { useCharacterSelect } from './useCharacterSelect';
import { useFirebase } from '@/shared/lib/firebase/useFirebase';
import { round } from '@/shared/lib/round';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

export const useChartImageShare = () => {
  const chartRef = useRef<ChartJSOrUndefined<'bar', number[], string>>(null);
  const [isSharingInProgress, setIsSharingInProgress] = useState(false);
  const { uploadImage } = useFirebase();
  const { character } = useCharacterSelect();
  const result = useCharacterLogAnalysis(character);
  const { sendEvent } = useGoogleAnalytics();

  const shareImage = useCallback(() => {
    if (!result) return;

    const { average, deviationScore, successRate, diceRollCount } =
      result.diceResultSummary;

    const averageStr = round(average, 2);
    const deviationScoreStr = round(deviationScore, 2);
    const successRateStr = `${round(successRate, 2)}%`;
    const diceRollCountStr = `${round(diceRollCount, 2)}回`;

    const text = encodeURIComponent(
      `▼あなたのダイス結果を分析した結果▼\n\n平均: ${averageStr}\nダイス偏差値: ${deviationScoreStr}\n成功率: ${successRateStr}\nダイスを振った回数: ${diceRollCountStr}\n\n#ダイススペック\n`,
    );

    if (!chartRef.current) {
      sendEvent('shareImage', 'no chart');
      const url = encodeURIComponent(
        `https://dicespec.vercel.app/analyze-logs`,
      );
      const href = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
      window.open(href, '_blank');
      return;
    }

    setIsSharingInProgress(true);
    sendEvent('shareImage', 'with chart');

    const base64ImageUrl = chartRef.current.toBase64Image();
    uploadImage(base64ImageUrl)
      .then((imageUrl) => {
        const ogp = encodeURIComponent(imageUrl);
        const url = encodeURIComponent(
          `https://dicespec.vercel.app/analyze-logs?ogp=${ogp}`,
        );
        const href = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        sendEvent('shareImage', 'success');
        window.open(href, '_blank');
      })
      .catch((err) => {
        sendEvent('shareImage', 'failed');
        console.error(err);
      })
      .finally(() => {
        setIsSharingInProgress(false);
      });
  }, [result, sendEvent, uploadImage]);

  return { chartRef, isSharingInProgress, shareImage };
};
