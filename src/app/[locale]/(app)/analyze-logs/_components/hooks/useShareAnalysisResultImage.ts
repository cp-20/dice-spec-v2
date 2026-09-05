import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import { nanoid } from 'nanoid';
import { useCallback, useTransition } from 'react';

import { useToast } from '@/shared/components/ui/use-toast';
import { getFirebaseStorage } from '@/shared/lib/firebase/client';
import { SHARED_IMAGE_SCOPES } from '@/shared/lib/firebase/storage/paths';
import { uploadSharedImageToStorage } from '@/shared/lib/firebase/storage/sharedImages';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';
import { round } from '@/shared/lib/round';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

import { encodeOgImageId } from '../og';
import { getShareUrl, type ShareDestination } from '../shareUrl';
import { sharingImageDataUrlAtom } from './shareAnalysisImageAtoms';
import { useCharacterLogAnalysis } from './useCharacterLogAnalysis';
import { useCharacterSelect } from './useCharacterSelect';

export const useShareAnalysisResultImage = () => {
  const [isSharingImage, startTransition] = useTransition();
  const storage = getFirebaseStorage();
  const { authUser } = useFirebaseAuth();
  const { toast } = useToast();
  const { character } = useCharacterSelect();
  const result = useCharacterLogAnalysis(character);
  const sharingImageDataUrl = useAtomValue(sharingImageDataUrlAtom);
  const { sendEvent } = useGoogleAnalytics();

  const shareImage = useCallback(
    (destination: ShareDestination, onCompleted?: () => void) => {
      if (!result) return;

      const { average, deviationScore, successRate, evaluatedRollCount, diceRollCount } = result.summary;

      const averageStr = round(average, 2);
      const deviationScoreStr = round(deviationScore, 2);
      const successRateStr = evaluatedRollCount === 0 ? '-' : `${round(successRate, 2)}%`;
      const text = t('analyze-logs:share-analysis-result.share-text', {
        average: averageStr,
        deviationScore: deviationScoreStr,
        successRate: successRateStr,
        diceRollCount: round(diceRollCount, 2),
      });

      startTransition(async () => {
        try {
          let url = 'https://dicespec.app/analyze-logs';
          if (sharingImageDataUrl !== null && authUser !== null) {
            const imageId = nanoid(32);
            const imageUrl = await uploadSharedImageToStorage(
              storage,
              SHARED_IMAGE_SCOPES['analyze-logs'],
              imageId,
              sharingImageDataUrl,
            );
            sendEvent('shareImage', imageUrl);
            url += `?ogp=${encodeOgImageId(imageId)}`;
          } else {
            sendEvent('shareImage', '');
          }

          window.open(getShareUrl(destination, text, url), '_blank', 'noopener,noreferrer');

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
