import { useAtomValue } from 'jotai';
import { useCallback, useTransition } from 'react';
import { useFirebase } from '@/shared/lib/firebase/useFirebase';
import { round } from '@/shared/lib/round';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';
import { useCharacterLogAnalysis } from './useCharacterLogAnalysis';
import { useCharacterSelect } from './useCharacterSelect';
import { sharingImageDataUrlAtom } from './useShareAnalysisResult';

export const useShareAnalysisResultImage = () => {
  const [isSharingImage, startTransition] = useTransition();
  const { uploadImage } = useFirebase();
  const { character } = useCharacterSelect();
  const result = useCharacterLogAnalysis(character);
  const sharingImageDataUrl = useAtomValue(sharingImageDataUrlAtom);
  const { sendEvent } = useGoogleAnalytics();

  const shareImage = useCallback(() => {
    if (!result) return;

    const { average, deviationScore, successRate, diceRollCount } = result.summary;

    const averageStr = round(average, 2);
    const deviationScoreStr = round(deviationScore, 2);
    const successRateStr = `${round(successRate, 2)}%`;
    const diceRollCountStr = `${round(diceRollCount, 2)}回`;

    const text = encodeURIComponent(
      `▼あなたのダイス結果を分析した結果▼\n\n平均: ${averageStr}\nダイス偏差値: ${deviationScoreStr}\n成功率: ${successRateStr}\nダイスを振った回数: ${diceRollCountStr}\n\n#ダイススペック\n`,
    );

    if (sharingImageDataUrl === null) {
      sendEvent('shareImage', '');
      const url = encodeURIComponent('https://dicespec.app/analyze-logs');
      const href = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
      window.open(href, '_blank');
      return;
    }

    startTransition(async () => {
      try {
        const imageUrl = await uploadImage(sharingImageDataUrl);
        sendEvent('shareImage', imageUrl);
        const ogp = encodeURIComponent(imageUrl);
        const url = encodeURIComponent(`https://dicespec.app/analyze-logs?ogp=${ogp}`);
        const href = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        window.open(href, '_blank');
      } catch (err) {
        sendEvent('shareImageFailed');
        console.error(err);
      }
    });
  }, [result, sendEvent, uploadImage, sharingImageDataUrl]);

  return { isSharingImage, shareImage };
};
