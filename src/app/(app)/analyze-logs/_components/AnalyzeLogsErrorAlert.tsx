'use client';

import { IconAlertCircle } from '@tabler/icons-react';
import type { FC } from 'react';

import { useLogAnalysis } from './hooks/useLogAnalysis';

export const AnalyzeLogsErrorAlert: FC = () => {
  const { result } = useLogAnalysis();

  if (result?.type !== 'error') return null;

  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="shrink-0">
          <IconAlertCircle className="h-5 w-5 text-red-700" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-700">
            解析中にエラーが発生しました。正しいログファイルをアップロードしているか、正しいシステムが選択されているかを確認してください。
          </h3>
        </div>
      </div>
    </div>
  );
};
