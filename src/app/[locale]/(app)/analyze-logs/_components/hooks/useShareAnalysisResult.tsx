import { IconLoader } from '@tabler/icons-react';
import { t } from 'i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import { type FC, useCallback, useEffect, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';

import { SharingAnalysisResultScreen } from '../SharingAnalysisResultScreen';
import {
  debouncedScenarioNameAtom,
  imageRefAtom,
  scenarioNameAtom,
  sharingImageDataUrlAtom,
  sharingImageVersionAtom,
} from './shareAnalysisImageAtoms';
import { useCharacterLogAnalysis } from './useCharacterLogAnalysis';
import { useCharacterSelect } from './useCharacterSelect';
import { useShareAnalysisResultImage } from './useShareAnalysisResultImage';

const useRegenerateImage = () => {
  const setVersion = useSetAtom(sharingImageVersionAtom);

  const regenerateImage = useCallback(() => {
    setVersion((v) => v + 1);
  }, [setVersion]);

  return { regenerateImage };
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
  const [shareOptionsOpen, setShareOptionsOpen] = useState(false);
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

                <div className="flex">
                  <Button
                    className="flex-1 rounded-r-none"
                    onClick={() => shareImage('X', () => setDialogOpen(false))}
                    disabled={isSharingImage}
                  >
                    {isSharingImage ? (
                      <span className="opacity-70 inline-flex gap-2 items-center">
                        <IconLoader className="animate-spin size-5" />
                        {t('analyze-logs:share-analysis-result:share-to', { destination: 'X' })}
                      </span>
                    ) : (
                      <span>{t('analyze-logs:share-analysis-result:share-to', { destination: 'X' })}</span>
                    )}
                  </Button>
                  <Popover open={shareOptionsOpen} onOpenChange={setShareOptionsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        className="rounded-l-none border-l border-primary-foreground/30 px-3"
                        disabled={isSharingImage}
                        aria-label={t('analyze-logs:share-analysis-result:other-destinations')}
                      >
                        <span aria-hidden="true">▼</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 p-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        disabled={isSharingImage}
                        onClick={() => {
                          setShareOptionsOpen(false);
                          shareImage('Bluesky', () => setDialogOpen(false));
                        }}
                      >
                        {t('analyze-logs:share-analysis-result:share-to', { destination: 'Bluesky' })}
                      </Button>
                    </PopoverContent>
                  </Popover>
                </div>
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
