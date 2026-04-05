import { t } from 'i18next';
import { nanoid } from 'nanoid';
import { useAtomValue } from 'jotai';
import { useCallback, useTransition } from 'react';
import { useFirebase } from '@/shared/lib/firebase/useFirebase';
import { uploadSharedImageToStorage } from '@/shared/lib/firebase/storage/sharedImages';
import { round } from '@/shared/lib/round';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';
import { useCharacterLogAnalysis } from './useCharacterLogAnalysis';
import { useCharacterSelect } from './useCharacterSelect';
import { sharingImageDataUrlAtom } from './useShareAnalysisResult';
import { SHARED_IMAGE_SCOPES } from '@/shared/lib/firebase/storage/paths';
import { encodeOgImageId } from '../og';

export const useShareAnalysisResultImage = () => {
  const [isSharingImage, startTransition] = useTransition();
  const { storage } = useFirebase();
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
    const text = encodeURIComponent(
      t('analyze-logs:share-analysis-result.share-text', {
        average: averageStr,
        deviationScore: deviationScoreStr,
        successRate: successRateStr,
        diceRollCount: round(diceRollCount, 2),
      }),
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
        const imageId = nanoid(32);
        const imageUrl = await uploadSharedImageToStorage(
          storage,
          SHARED_IMAGE_SCOPES['analyze-logs'],
          imageId,
          sharingImageDataUrl,
        );
        sendEvent('shareImage', imageUrl);
        const ogp = encodeOgImageId(imageId);
        const url = encodeURIComponent(`https://dicespec.app/analyze-logs?ogp=${ogp}`);
        const href = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        window.open(href, '_blank');
      } catch (err) {
        sendEvent('shareImageFailed');
        console.error(err);
      }
    });
  }, [result, sendEvent, sharingImageDataUrl, storage]);

  return { isSharingImage, shareImage };
};
