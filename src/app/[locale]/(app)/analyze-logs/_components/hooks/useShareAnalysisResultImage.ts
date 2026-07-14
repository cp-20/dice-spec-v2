import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import { nanoid } from 'nanoid';
import { useCallback, useTransition } from 'react';

import { useToast } from '@/shared/components/ui/use-toast';
import { getFirebaseServices } from '@/shared/lib/firebase/client';
import { SHARED_IMAGE_SCOPES } from '@/shared/lib/firebase/storage/paths';
import { uploadSharedImageToStorage } from '@/shared/lib/firebase/storage/sharedImages';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';
import { round } from '@/shared/lib/round';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

import { encodeOgImageId } from '../og';
import { sharingImageDataUrlAtom } from './shareAnalysisImageAtoms';
import { useCharacterLogAnalysis } from './useCharacterLogAnalysis';
import { useCharacterSelect } from './useCharacterSelect';

export const useShareAnalysisResultImage = () => {
  const [isSharingImage, startTransition] = useTransition();
  const { storage } = getFirebaseServices();
  const { authUser } = useFirebaseAuth();
  const { toast } = useToast();
  const { character } = useCharacterSelect();
  const result = useCharacterLogAnalysis(character);
  const sharingImageDataUrl = useAtomValue(sharingImageDataUrlAtom);
  const { sendEvent } = useGoogleAnalytics();

  const shareImage = useCallback(
    (onCompleted?: () => void) => {
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

      if (sharingImageDataUrl === null || authUser === null) {
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

          onCompleted?.();
        } catch (err) {
          sendEvent('shareImageFailed');
          console.error(err);

          toast({
            title: t('analyze-logs:share-analysis-result.share-image-failed'),
            description: t('analyze-logs:share-analysis-result.share-image-failed-description'),
            variant: 'destructive',
          });
        }
      });
    },
    [authUser, result, sendEvent, sharingImageDataUrl, storage, toast],
  );

  return { isSharingImage, shareImage };
};
