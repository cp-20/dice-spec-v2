import { useAtomValue } from 'jotai';
import { nanoid } from 'nanoid';
import { useCallback, useTransition } from 'react';

import { useToast } from '@/shared/components/ui/use-toast';
import { getFirebaseStorage } from '@/shared/lib/firebase/client';
import { SHARED_IMAGE_SCOPES } from '@/shared/lib/firebase/storage/paths';
import { uploadSharedImageToStorage } from '@/shared/lib/firebase/storage/sharedImages';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';
import { round } from '@/shared/lib/round';
import { captureClientException } from '@/shared/lib/sentryClient';
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
      const text = `▼あなたのダイス結果を分析した結果▼

平均: ${averageStr}
ダイス偏差値: ${deviationScoreStr}
成功率: ${successRateStr}
ダイスを振った回数: ${round(diceRollCount, 2)}回

#ダイススペック
`;

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
          captureClientException(err);

          toast({
            title: '画像のシェアに失敗しました',
            description: '画像の生成またはアップロードに失敗しました。時間をおいて再度お試しください。',
            variant: 'destructive',
          });
        }
      });
    },
    [authUser, result, sendEvent, sharingImageDataUrl, storage, toast],
  );

  return { isSharingImage, shareImage };
};
