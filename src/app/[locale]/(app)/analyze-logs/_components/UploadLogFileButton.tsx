'use client';

import { IconUpload, IconX } from '@tabler/icons-react';
import { t } from 'i18next';
import { type FC, useCallback, useRef, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

import { useDropzone } from './hooks/useDropzone';
import { useLogFiles, useLogTabSelect } from './hooks/useLogAnalysis';

export const UploadLogFileButton: FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { logFiles, setLogFiles, isImporting, importFiles, duplicateCount } = useLogFiles();
  const { resetSelectedTabs } = useLogTabSelect();
  const { sendEvent } = useGoogleAnalytics();
  const [errors, setErrors] = useState<{ name: string; code: string }[]>([]);

  const dropHandler = useCallback(
    async (files: File[]) => {
      if (isImporting) return;
      setErrors([]);
      const failures = await importFiles(files);
      setErrors(failures);
      sendEvent('upload_log', { file_count: files.length - failures.length });
      if (inputRef.current) inputRef.current.value = '';
    },
    [importFiles, isImporting, sendEvent],
  );

  const { containerProps, inputProps, isDraggedOver } = useDropzone(dropHandler);
  const clear = () => {
    setLogFiles([]);
    resetSelectedTabs();
    setErrors([]);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <div
        className="flex min-h-20 flex-wrap items-center justify-between gap-3 rounded-md border border-input p-4 text-sm"
        {...containerProps}
        aria-busy={isImporting}
      >
        {logFiles.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span>{t('analyze-logs:upload.current-file')}: </span>
            {logFiles.map((file, index) => (
              <span
                className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-1"
                key={`${file.name}-${index}`}
              >
                <span className="break-all">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  disabled={isImporting}
                  aria-label={t('analyze-logs:upload.remove-file', { name: file.name })}
                  onClick={() => {
                    setLogFiles((previous) => previous.filter((_, i) => i !== index));
                    resetSelectedTabs();
                  }}
                >
                  <IconX size={14} />
                </Button>
              </span>
            ))}
          </div>
        )}
        <div className={logFiles.length === 0 ? 'w-full' : 'flex items-center gap-2'}>
          <Button
            type="button"
            variant="outline"
            disabled={isImporting}
            className={logFiles.length === 0 ? 'h-auto w-full whitespace-normal' : undefined}
            onClick={() => inputRef.current?.click()}
          >
            <IconUpload className="shrink-0" size={18} />
            {isImporting
              ? t('analyze-logs:upload.loading')
              : isDraggedOver
                ? t('analyze-logs:upload.button-mouseover')
                : t(logFiles.length === 0 ? 'analyze-logs:upload.button' : 'analyze-logs:upload.add-button')}
          </Button>
          {logFiles.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clear}
              disabled={isImporting}
              aria-label={t('analyze-logs:upload.clear-button')}
            >
              <IconX />
            </Button>
          )}
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
      <p className="text-sm text-muted-foreground">{t('analyze-logs:upload.formats')}</p>
      <output className="block text-sm">
        {isImporting
          ? t('analyze-logs:upload.loading')
          : duplicateCount > 0
            ? t('analyze-logs:upload.duplicates', { count: duplicateCount })
            : null}
      </output>
      {errors.length > 0 && (
        <div role="alert" className="space-y-1 text-sm text-destructive">
          {errors.map(({ name, code }, index) => (
            <p key={`${name}-${index}`}>
              {name}: {t(`analyze-logs:upload.errors.${code}`)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
