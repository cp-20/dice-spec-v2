'use client';

import { IconBrandX, IconLoader } from '@tabler/icons-react';
import { t } from 'i18next';
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
            <IconBrandX />
            <span>{t('analyze-logs:stats.share')}</span>
          </div>
        )}
      </Button>
      {render()}
    </>
  );
};
