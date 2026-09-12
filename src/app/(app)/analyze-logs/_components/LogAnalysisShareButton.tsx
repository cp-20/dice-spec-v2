'use client';

import { IconShare, IconLoader } from '@tabler/icons-react';
import type { FC } from 'react';

import { Button } from '@/shared/components/ui/button';

import { useShareAnalysisResult } from './hooks/useShareAnalysisResult';

export const LogAnalysisShareButton: FC = () => {
  const { shareImage, isSharingImage, canShareImage, render } = useShareAnalysisResult();

  return (
    <>
      <Button variant="secondary" className="w-full" onClick={shareImage} disabled={isSharingImage || !canShareImage}>
        {isSharingImage ? (
          <div className="animate-slide-in-top" key="sharing-in-progress">
            <IconLoader className="animate-spin" />
          </div>
        ) : (
          <div className="flex animate-slide-in-top gap-2" key="share-button">
            <IconShare />
            <span>解析結果をシェア</span>
          </div>
        )}
      </Button>
      {render()}
    </>
  );
};
