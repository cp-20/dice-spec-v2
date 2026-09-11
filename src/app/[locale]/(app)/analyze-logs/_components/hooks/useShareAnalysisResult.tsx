import { IconChevronDown, IconLoader } from '@tabler/icons-react';
import { t } from 'i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import { type FC, useCallback, useDeferredValue, useEffect, useState, ViewTransition } from 'react';

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
import { useShareDestination } from './useShareDestination';

const useRegenerateImage = () => {
  const setVersion = useSetAtom(sharingImageVersionAtom);

  const regenerateImage = useCallback(() => {
    setVersion((v) => v + 1);
  }, [setVersion]);

  return { regenerateImage };
};

const SharingImagePreview: FC = () => {
  const sharingImageDataUrl = useDeferredValue(useAtomValue(sharingImageDataUrlAtom));

  return (
    <ViewTransition name="sharing-image-preview">
      {sharingImageDataUrl === null ? (
        <div className="w-full aspect-1200/630 bg-slate-100 border-slate-200 border rounded" />
      ) : (
        // oxlint-disable-next-line nextjs/no-img-element dynamically generated image
        <img
          src={sharingImageDataUrl}
          alt={t('analyze-logs:share-analysis-result:image-alt')}
          className="w-full bg-slate-100 border-slate-200 border rounded"
        />
      )}
    </ViewTransition>
  );
};

export const useShareAnalysisResult = () => {
  const [destination, setDestination] = useShareDestination();
  const otherDestination = destination === 'X' ? 'Bluesky' : 'X';
  const [dialogOpen, setDialogOpen] = useState(false);
  const [shareOptionsOpen, setShareOptionsOpen] = useState(false);
  const scenarioName = useAtomValue(scenarioNameAtom);
  const setScenarioName = useSetAtom(debouncedScenarioNameAtom);
  const { isSharingImage, shareImage } = useShareAnalysisResultImage();
  const sharingImageDataUrl = useAtomValue(sharingImageDataUrlAtom);
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
                    onClick={() => shareImage(destination, () => setDialogOpen(false))}
                    disabled={isSharingImage || sharingImageDataUrl === null}
                  >
                    {isSharingImage ? (
                      <span className="opacity-70 inline-flex gap-2 items-center">
                        <IconLoader className="animate-spin size-5" />
                        {t('analyze-logs:share-analysis-result:share-to', { destination })}
                      </span>
                    ) : (
                      <span>{t('analyze-logs:share-analysis-result:share-to', { destination })}</span>
                    )}
                  </Button>
                  <Popover open={shareOptionsOpen} onOpenChange={setShareOptionsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        className="min-h-11 min-w-11 rounded-l-none border-l border-primary-foreground/30 px-3"
                        disabled={isSharingImage || sharingImageDataUrl === null}
                        aria-label={t('analyze-logs:share-analysis-result:other-destinations')}
                      >
                        <IconChevronDown className="size-4" aria-hidden="true" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 p-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        disabled={isSharingImage || sharingImageDataUrl === null}
                        onClick={() => {
                          setShareOptionsOpen(false);
                          setDestination(otherDestination);
                          shareImage(otherDestination, () => setDialogOpen(false));
                        }}
                      >
                        {t('analyze-logs:share-analysis-result:share-to', { destination: otherDestination })}
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
