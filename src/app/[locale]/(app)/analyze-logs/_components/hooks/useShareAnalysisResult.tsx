import { toSvg } from 'html-to-image';
import { useRef, useTransition } from 'react';
import { LogAnalysisRankingChart } from '@/app/[locale]/(app)/analyze-logs/_components/LogAnalysisRankingChart';
import { useCharacterLogAnalysis } from './useCharacterLogAnalysis';
import { useCharacterSelect } from './useCharacterSelect';

export const useShareAnalysisResult = () => {
  const [isSharingImage, startTransition] = useTransition();

  const { character } = useCharacterSelect();
  const analysisResult = useCharacterLogAnalysis(character);
  const canShareImage = analysisResult !== null;

  const imageRef = useRef<HTMLDivElement>(null);

  const shareImage = () => {
    startTransition(async () => {
      if (imageRef.current === null) return;
      // data url
      const result = await toSvg(imageRef.current);
      const filename = `${String(character ?? 'analysis')}.svg`;

      if (result.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = result;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const blob = new Blob([result], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    });
  };

  const render = () => {
    return (
      <div className="fixed left-2 top-2 border">
        <div ref={imageRef} className="p-4 bg-white w-300 h-157.5">
          <div className="text-2xl font-bold">恐怖山脈</div>
          <div className="flex">
            <div className="w-80">平均</div>
            <div className="flex-1">
              <LogAnalysisRankingChart />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return {
    shareImage,
    isSharingImage,
    canShareImage,
    render,
  };
};
