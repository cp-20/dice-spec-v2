'use client';

import { IconAlertCircle } from '@tabler/icons-react';
import { t } from 'i18next';
import type { FC } from 'react';
import { useLogAnalysis } from './hooks/useLogAnalysis';

export const AnalyzeLogsErrorAlert: FC = () => {
  const { result } = useLogAnalysis();
  console.log(result);

  if (result?.type !== 'error') return null;

  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="shrink-0">
          <IconAlertCircle className="h-5 w-5 text-red-700" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-700">{t('analyze-logs:error')}</h3>
        </div>
      </div>
    </div>
  );
};
