'use client';

import { IconUpload, IconX } from '@tabler/icons-react';
import { t } from 'i18next';
import { type FC, useCallback, useRef } from 'react';

import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/use-toast';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

import { useDropzone } from './hooks/useDropzone';
import { useLogFiles, useLogTabSelect } from './hooks/useLogAnalysis';

export const UploadLogFileButton: FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { logFiles, setLogFiles, isImporting, importFiles } = useLogFiles();
  const { resetSelectedTabs } = useLogTabSelect();
  const { sendEvent } = useGoogleAnalytics();

  const dropHandler = useCallback(
    async (files: File[]) => {
      if (isImporting) return;
      const failures = await importFiles(files);
      if (failures.length > 0) {
        toast({
          title: t('analyze-logs:error'),
          description: failures
            .map(({ name, code }) => `${name}: ${t(`analyze-logs:upload.errors.${code}`)}`)
            .join('\n'),
          variant: 'destructive',
        });
      }
      sendEvent('upload_log', { file_count: files.length - failures.length });
      if (inputRef.current) inputRef.current.value = '';
    },
    [importFiles, isImporting, sendEvent, toast],
  );

  const { containerProps, inputProps, isDraggedOver } = useDropzone(dropHandler);

  const handleRemove = useCallback(() => {
    setLogFiles([]);
    resetSelectedTabs();
    if (inputRef.current) inputRef.current.value = '';
  }, [resetSelectedTabs, setLogFiles]);

  if (logFiles.length === 0) {
    return (
      <Button asChild variant="outline">
        <label
          htmlFor="log-file-uploader"
          className="h-fit min-h-20 w-full place-content-center p-4"
          {...containerProps}
          aria-busy={isImporting}
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
            accept=".html,.htm,.json,.zip"
            multiple
            className="hidden"
            ref={inputRef}
            disabled={isImporting}
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
      aria-busy={isImporting}
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
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          disabled={isImporting}
          aria-label={t('analyze-logs:upload.clear-button')}
        >
          <IconX />
        </Button>
      </div>
      <input
        id="log-file-uploader"
        type="file"
        accept=".html,.htm,.json,.zip"
        multiple
        className="hidden"
        ref={inputRef}
        disabled={isImporting}
        {...inputProps}
      />
    </div>
  );
};
