'use client';

import { IconUpload, IconX } from '@tabler/icons-react';
import { type FC, useCallback, useRef } from 'react';

import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/use-toast';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

import { useDropzone } from './hooks/useDropzone';
import { useLogFiles, useLogTabSelect } from './hooks/useLogAnalysis';

const uploadErrors = {
  unsupported: 'HTML・JSON・ZIPのログファイルを選択してください。',
  invalid: 'ログの形式を読み取れませんでした。ココフォリアから出力し直してください。',
  empty: '解析できるログが含まれていません。',
  'too-large': '256MBを超えています。ログを分割するか、ZIP内のファイルを個別に選択してください。',
  read: 'ファイルを読み込めませんでした。もう一度選択してください。',
};

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
          title:
            '解析中にエラーが発生しました。正しいログファイルをアップロードしているか、正しいシステムが選択されているかを確認してください。',
          description: failures.map(({ name, code }) => `${name}: ${uploadErrors[code]}`).join('\n'),
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
              離してアップロード
            </div>
          ) : (
            <div className="flex flex-wrap justify-center animate-slide-in-top items-center gap-2" key="content">
              <IconUpload className="shrink-0" />
              <span className="text-wrap">
                クリックしてアップロード、あるいはドラッグアンドドロップしてアップロード
              </span>
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
        <span>現在選択されているファイル: </span>
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
            <span>ログを追加</span>
          </label>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          disabled={isImporting}
          aria-label="選択したログを削除"
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
