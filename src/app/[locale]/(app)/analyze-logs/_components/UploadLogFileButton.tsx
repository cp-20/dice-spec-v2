'use client';

import { IconUpload, IconX } from '@tabler/icons-react';
import { t } from 'i18next';
import { type FC, useCallback, useRef } from 'react';

import { Button } from '@/shared/components/ui/button';

import { useDropzone } from './hooks/useDropzone';
import { useLogFiles } from './hooks/useLogAnalysis';

const readFileAsText = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
        return;
      }
      reject(new Error('Failed to read file'));
    });
    reader.addEventListener('error', () => reject(reader.error ?? new Error('Failed to read file')));
    reader.readAsText(file);
  });

export const UploadLogFileButton: FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { logFiles, setLogFiles } = useLogFiles();

  const dropHandler = useCallback(
    async (files: File[]) => {
      const readFiles = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          content: await readFileAsText(file),
        })),
      );
      setLogFiles((prev) => [...prev, ...readFiles]);
      if (inputRef.current) inputRef.current.value = '';
    },
    [setLogFiles],
  );

  const { containerProps, inputProps, isDraggedOver } = useDropzone(dropHandler);

  const handleRemove = useCallback(() => {
    setLogFiles([]);
    if (inputRef.current) inputRef.current.value = '';
  }, [setLogFiles]);

  if (logFiles.length === 0) {
    return (
      <Button asChild variant="outline">
        <label
          htmlFor="log-file-uploader"
          className="h-fit min-h-20 w-full place-content-center p-4"
          {...containerProps}
        >
          {isDraggedOver ? (
            <div className="animate-slide-in-top" key="drag-over">
              {t('analyze-logs:upload.button-mouseover')}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center animate-slide-in-top items-center gap-2" key="content">
              <IconUpload className="shrink-0" />
              <span className="text-wrap">{t('analyze-logs:upload.button')}</span>
            </div>
          )}
          <input
            id="log-file-uploader"
            type="file"
            accept="text/html"
            multiple
            className="hidden"
            ref={inputRef}
            {...inputProps}
          />
        </label>
      </Button>
    );
  }

  return (
    <div
      className="flex min-h-20 w-full flex-wrap items-center justify-between gap-3 rounded-md border border-input bg-background p-4 text-sm shadow-xs"
      {...containerProps}
    >
      <div className="inline-flex animate-slide-in-top flex-wrap items-center gap-2">
        <span>{t('analyze-logs:upload.current-file')}: </span>
        <div className="inline-flex flex-wrap gap-2">
          {logFiles.map((file, index) => (
            <span className="rounded-sm bg-muted px-2 py-1 font-bold" key={`${file.name}-${index}`}>
              {file.name}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <label htmlFor="log-file-uploader" className="cursor-pointer gap-2">
            <IconUpload size="18" />
            <span>{t('analyze-logs:upload.add-button')}</span>
          </label>
        </Button>
        <Button variant="ghost" size="icon" onClick={handleRemove} aria-label={t('analyze-logs:upload.clear-button')}>
          <IconX />
        </Button>
      </div>
      <input
        id="log-file-uploader"
        type="file"
        accept="text/html"
        multiple
        className="hidden"
        ref={inputRef}
        {...inputProps}
      />
    </div>
  );
};
