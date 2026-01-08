import { IconLoader } from '@tabler/icons-react';
import clsx from 'clsx';
import { toPng } from 'html-to-image';
import { t } from 'i18next';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { type FC, type ReactNode, useCallback, useState } from 'react';
import { TitleLogo } from '@/shared/components/elements/TitleLogo';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { atomWithDebounce } from '@/shared/lib/jotai/atomWithDebounce';
import { round } from '@/shared/lib/round';
import LogoIcon from '/public/icon.svg';
import { LogAnalysisRankingChart } from '../LogAnalysisRankingChart';
import { useCharacterLogAnalysis } from './useCharacterLogAnalysis';
import { logAnalysisCharacterAtom, useCharacterSelect } from './useCharacterSelect';
import { logAnalysisResultAtom } from './useLogAnalysis';
import { useShareAnalysisResultImage } from './useShareAnalysisResultImage';

interface StatsProps {
  label: ReactNode;
  number: ReactNode;
  unit?: ReactNode;
  small?: ReactNode;
}

const Stats: FC<StatsProps> = ({ label, number, unit, small }) => {
  return (
    <div>
      <div className="text-slate-500 mb-1 font-bold text-xl">{label}</div>
      <div className="flex items-baseline">
        <span className="text-6xl font-bold text-slate-900">{number}</span>
        {unit && <span className="ml-1 text-2xl text-slate-700 font-bold">{unit}</span>}
        {small && <div className="text-xl text-slate-400 font-bold ml-2">{`/ ${small}`}</div>}
      </div>
    </div>
  );
};

const imageRefAtom = atom<React.RefObject<HTMLDivElement | null> | undefined>(undefined);
const { currentValueAtom: scenarioNameAtom, debouncedValueAtom: debouncedScenarioNameAtom } = atomWithDebounce(
  '',
  300,
  true,
);
export const sharingImageDataUrlAtom = atom(async (get) => {
  // implicitly dependencies
  get(debouncedScenarioNameAtom);
  get(logAnalysisCharacterAtom);
  get(logAnalysisResultAtom);

  const imageRef = get(imageRefAtom);

  if (imageRef?.current === null || imageRef?.current === undefined) return null;

  const dataUrl = await toPng(imageRef.current);
  return dataUrl;
});

const SharingImagePreview: FC = () => {
  const sharingImageDataUrl = useAtomValue(sharingImageDataUrlAtom);

  if (sharingImageDataUrl === null) {
    return <div className="w-full aspect-1200/630 bg-slate-100 border-slate-200 border rounded" />;
  }

  return (
    /** biome-ignore lint/performance/noImgElement: dynamically generated image */
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

                <Button className="w-full" onClick={shareImage} disabled={isSharingImage}>
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
        <div className="fixed -left-1 -top-1 -translate-full">
          <SharingAnalysisResult className="w-[1200px]" />
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

interface SharingAnalysisResultProps {
  className?: string;
}

const SharingAnalysisResult: FC<SharingAnalysisResultProps> = ({ className }) => {
  const { character } = useCharacterSelect();
  const analysisResult = useCharacterLogAnalysis(character);
  const numberWrapper = (number: ReactNode) => analysisResult && number;

  const scenarioName = useAtomValue(scenarioNameAtom);
  const setImageRef = useSetAtom(imageRefAtom);
  const imageRefCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (node !== null) {
        setImageRef({ current: node });
      }
    },
    [setImageRef],
  );

  return (
    <div
      ref={imageRefCallback}
      className={clsx('p-12 pl-24 bg-white aspect-1200/630 relative flex flex-col gap-20', className)}
    >
      <div className="text-4xl font-bold text-slate-900">{scenarioName || 'ログ解析結果'}</div>

      <div className="flex gap-12 min-h-0 flex-1">
        <div className="space-y-8">
          <Stats
            label={t('analyze-logs:stats.mean')}
            number={numberWrapper(analysisResult && round(analysisResult.summary.average, 2))}
          />
          <Stats
            label={t('analyze-logs:stats.success-rate')}
            number={numberWrapper(analysisResult && round(analysisResult.summary.successRate, 2))}
            unit="%"
          />
          <Stats
            label={t('analyze-logs:stats.roll-count')}
            number={numberWrapper(analysisResult?.summary.diceRollCount)}
            unit={t('analyze-logs:stats.roll-count-unit')}
            small={
              analysisResult?.summary.diceCount !== analysisResult?.summary.diceRollCount &&
              `${analysisResult?.summary.diceCount}${t('analyze-logs:stats.dice-count-unit')}`
            }
          />
        </div>

        <div className="flex-1 space-y-4">
          <LogAnalysisRankingChart className="-mt-16" />
        </div>
      </div>
      <div className="flex items-center gap-1 justify-end absolute bottom-4 right-4">
        <LogoIcon className="size-8" />
        <TitleLogo className="h-6" />
      </div>
    </div>
  );
};
