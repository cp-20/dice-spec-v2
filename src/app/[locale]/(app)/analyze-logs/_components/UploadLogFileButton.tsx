'use client';

import { IconUpload } from '@tabler/icons-react';
import { IconX } from '@tabler/icons-react';
import { t } from 'i18next';
import { useCallback, type FC, useState, useRef } from 'react';
import { useDropzone } from './hooks/useDropzone';
import { useLogAnalysis } from './hooks/useLogAnalysis';
import { Button } from '@/shared/components/ui/button';

export const UploadLogFileButton: FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);

  const { analyze, reset } = useLogAnalysis();
  const dropHandler = useCallback(
    (filename: string, content: string) => {
      setCurrentFile(filename);
      analyze(content);
    },
    [analyze],
  );

  const { containerProps, inputProps, isDraggedOver } =
    useDropzone(dropHandler);

  const handleRemove = useCallback(() => {
    setCurrentFile(null);
    reset();
    if (inputRef.current) inputRef.current.value = '';
  }, [reset]);

  return (
    <Button asChild variant="outline">
      {currentFile === null ? (
        <label
          htmlFor="log-file-uploader"
          className="inline-grid h-fit min-h-20 w-full place-content-center p-4"
          {...containerProps}
        >
          {isDraggedOver ? (
            <div className="animate-slide-in-top" key="drag-over">
              {t('analyze-logs:upload.button-mouseover')}
            </div>
          ) : (
            <div
              className="inline-flex animate-slide-in-top items-center gap-2"
              key="content"
            >
              <IconUpload className="shrink-0" />
              <span>{t('analyze-logs:upload.button')}</span>
            </div>
          )}
          <input
            id="log-file-uploader"
            type="file"
            accept="text/html"
            className="hidden"
            ref={inputRef}
            {...inputProps}
          />
        </label>
      ) : (
        <div className="h-20 w-full p-4">
          <div className="inline-flex animate-slide-in-top items-center justify-center gap-4">
            <div className="inline-flex flex-wrap">
              <span>{t('analyze-logs:upload.current-file')}: </span>
              <span className="font-bold">{currentFile}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRemove}>
              <IconX />
            </Button>
          </div>
        </div>
      )}
    </Button>
  );
};
