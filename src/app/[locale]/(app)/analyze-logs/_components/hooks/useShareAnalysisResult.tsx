import { IconLoader } from '@tabler/icons-react';
import { toPng } from 'html-to-image';
import { t } from 'i18next';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { type FC, useCallback, useEffect, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { atomWithDebounce } from '@/shared/lib/jotai/atomWithDebounce';

import { SharingAnalysisResultScreen } from '../SharingAnalysisResultScreen';
import { useCharacterLogAnalysis } from './useCharacterLogAnalysis';
import { useCharacterSelect } from './useCharacterSelect';
import { useShareAnalysisResultImage } from './useShareAnalysisResultImage';

const imageRefAtom = atom<React.RefObject<HTMLDivElement | null> | undefined>(undefined);
const { currentValueAtom: scenarioNameAtom, debouncedValueAtom: debouncedScenarioNameAtom } = atomWithDebounce(
  '',
  300,
  true,
);

const sharingImageVersion = atom(0);
const useRegenerateImage = () => {
  const setVersion = useSetAtom(sharingImageVersion);

  const regenerateImage = useCallback(() => {
    setVersion((v) => v + 1);
  }, [setVersion]);

  return { regenerateImage };
};

export const sharingImageDataUrlAtom = atom(async (get) => {
  get(sharingImageVersion);

  const imageRef = get(imageRefAtom);

  if (imageRef?.current === null || imageRef?.current === undefined) return null;

  const dataUrl = await toPng(imageRef.current);
  return dataUrl;
});

export const useGenerateShareAnalysisImageDataUrl = () => {
  const imageRef = useAtomValue(imageRefAtom);

  const generateShareImageDataUrl = useCallback(async () => {
    if (imageRef?.current === null || imageRef?.current === undefined) return null;
    return await toPng(imageRef.current);
  }, [imageRef]);

  return { generateShareImageDataUrl };
};

const SharingImagePreview: FC = () => {
  const sharingImageDataUrl = useAtomValue(sharingImageDataUrlAtom);

  if (sharingImageDataUrl === null) {
    return <div className="w-full aspect-1200/630 bg-slate-100 border-slate-200 border rounded" />;
  }

  return (
    // oxlint-disable-next-line nextjs/no-img-element dynamically generated image
    <img
      src={sharingImageDataUrl}
      alt={t('analyze-logs:share-analysis-result:image-alt')}
      className="w-full bg-slate-100 border-slate-200 border rounded"
    />
  );
};

export const useShareAnalysisResult = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const scenarioName = useAtomValue(scenarioNameAtom);
  const setScenarioName = useSetAtom(debouncedScenarioNameAtom);
  const { isSharingImage, shareImage } = useShareAnalysisResultImage();
  const { character } = useCharacterSelect();
  const analysisResult = useCharacterLogAnalysis(character);
  const canShareImage = analysisResult !== null;

  const render = () => {
    return (
      <>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogTitle>
              <div className="text-2xl font-bold">{t('analyze-logs:share-analysis-result:title')}</div>
            </DialogTitle>

            <div className="flex flex-col gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="scenario-name">{t('analyze-logs:share-analysis-result:scenario-name')}</Label>
                  <div className="text-xs text-slate-500">
                    {t('analyze-logs:share-analysis-result:scenario-name-description')}
                  </div>
                  <Input id="scenario-name" value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} />
                </div>

                <SharingImagePreview />

                <Button
                  className="w-full"
                  onClick={() => shareImage(() => setDialogOpen(false))}
                  disabled={isSharingImage}
                >
                  {isSharingImage ? (
                    <span className="opacity-70 inline-flex gap-2 items-center">
                      <IconLoader className="animate-spin size-5" />
                      {t('analyze-logs:share-analysis-result:share-image')}
                    </span>
                  ) : (
                    <span>{t('analyze-logs:share-analysis-result:share-image')}</span>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <div className="fixed -left-1 -top-1 -translate-full w-300">
          <SharingAnalysisResult />
        </div>
      </>
    );
  };

  const openShareImageDialog = () => {
    setDialogOpen(true);
  };

  return {
    shareImage: openShareImageDialog,
    isSharingImage,
    canShareImage,
    render,
  };
};

const SharingAnalysisResult: FC = () => {
  const { character } = useCharacterSelect();
  const analysisResult = useCharacterLogAnalysis(character);

  const debouncedScenarioName = useAtomValue(debouncedScenarioNameAtom);
  const setImageRef = useSetAtom(imageRefAtom);
  const imageRefCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (node !== null) {
        setImageRef({ current: node });
      }
    },
    [setImageRef],
  );

  const { regenerateImage } = useRegenerateImage();

  // biome-ignore lint/correctness/useExhaustiveDependencies: regenerate image after every render
  useEffect(() => {
    regenerateImage();
  }, [regenerateImage, analysisResult, debouncedScenarioName]);

  if (analysisResult === undefined) {
    return null;
  }

  return (
    <SharingAnalysisResultScreen
      ref={imageRefCallback}
      scenarioName={debouncedScenarioName}
      analysisResult={analysisResult}
    />
  );
};
