import { parseHtmlLog } from './htmlParser';
import { parseJsonLog } from './jsonParser';
import { mergeStructuredLogs, type StructuredLog } from './structuredLog';

export type ImportedLogFile = { name: string; logs: StructuredLog[]; duplicateCount: number };
export type LogImportErrorCode = 'unsupported' | 'invalid' | 'empty' | 'too-large' | 'read';
export class LogImportError extends Error {
  constructor(public readonly code: LogImportErrorCode) {
    super(code);
  }
}

// 画像を含む出力やZIPの展開でブラウザのメモリを使い切らないよう、読み込み前に制限する。
export const MAX_LOG_FILE_BYTES = 256 * 1024 * 1024;
const isLogName = (name: string) => /\.(html?|json)$/i.test(name);

const parseContent = (name: string, content: string) => {
  try {
    return /\.json$/i.test(name) ? parseJsonLog(content.replace(/^\uFEFF/, '')) : parseHtmlLog(content);
  } catch {
    throw new LogImportError('invalid');
  }
};

const readFile = (file: File) =>
  new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      reader.result instanceof ArrayBuffer ? resolve(reader.result) : reject(new LogImportError('read'));
    reader.onerror = () => reject(new LogImportError('read'));
    reader.onabort = () => reject(new LogImportError('read'));
    reader.readAsArrayBuffer(file);
  });

export const importLogFile = async (file: File): Promise<ImportedLogFile> => {
  const zip = /\.zip$/i.test(file.name);
  if (!zip && !isLogName(file.name)) throw new LogImportError('unsupported');
  if (file.size > MAX_LOG_FILE_BYTES) throw new LogImportError('too-large');
  const bytes = new Uint8Array(await readFile(file));
  let sources: StructuredLog[][];
  if (zip) {
    const { unzip } = await import('fflate');
    const entries = await new Promise<Record<string, Uint8Array>>((resolve, reject) => {
      let total = 0;
      try {
        unzip(
          bytes,
          {
            filter: (entry) => {
              if (!isLogName(entry.name) || entry.name.split('/').some((part) => part.startsWith('.'))) return false;
              total += entry.originalSize;
              if (total > MAX_LOG_FILE_BYTES) throw new LogImportError('too-large');
              return true;
            },
          },
          (error, data) => (error ? reject(new LogImportError('invalid')) : resolve(data)),
        );
      } catch (error) {
        reject(error instanceof LogImportError ? error : new LogImportError('invalid'));
      }
    });
    const logEntries = Object.entries(entries);
    const allTabs = logEntries.filter(([name]) => /\[すべて\](?:_\d+)?\.html?$/i.test(name));
    sources = (allTabs.length > 0 ? allTabs : logEntries)
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
      .map(([name, data]) => parseContent(name, new TextDecoder().decode(data)));
  } else {
    sources = [parseContent(file.name, new TextDecoder().decode(bytes))];
  }
  const result = mergeStructuredLogs(sources);
  if (result.logs.length === 0) throw new LogImportError('empty');
  return { name: file.name, ...result };
};
