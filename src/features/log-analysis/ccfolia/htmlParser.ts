import { logTab, type StructuredLog } from './structuredLog';

// input: html 形式のログ
// output: 構造化されたログ
export const parseHtmlLog = (html: string): StructuredLog[] => {
  const parser = new DOMParser();

  const doc = parser.parseFromString(html, 'text/html');
  if (doc.querySelector('main.message-list')) {
    return parseModernHtml(doc);
  }
  const logElements = Array.from(doc.querySelectorAll<HTMLElement>('body > p'));

  if (logElements.length === 0) throw new Error('Invalid log format');

  for (const br of doc.querySelectorAll('br')) br.replaceWith('\n');

  const logs = logElements.map((el) => {
    const spanElements = Array.from(el.querySelectorAll<HTMLElement>(':scope > span'));
    const textContents = spanElements.map((el) => el.textContent ?? '');
    if (textContents.length < 3) {
      throw new Error('Invalid log format');
    }
    const [tab, character] = textContents;
    // 秘匿ログには宛先のspanが挟まるため、本文は最後のspanから読む。
    const message = textContents.at(-1)!;
    const tabName = tab.trim().replace(/^\[|\]$/g, '');
    const standardTab = ({ メイン: 'main', 情報: 'info', 雑談: 'other' } as Record<string, string>)[tabName];
    // style全体の文字列に依存せず、色の宣言を読む。
    const color = el.style.color || null;

    return { color, tab: standardTab ? `[${standardTab}]` : tab.trim(), character, message: message.trim() };
  });

  return logs;
};

const parseModernHtml = (doc: Document): StructuredLog[] => {
  const titleTab = doc.querySelector('.log-title')?.textContent?.match(/\[([^\]]*)\]$/)?.[1] ?? '';
  return Array.from(doc.querySelectorAll('main.message-list > article.message')).map((el) => {
    const channel = el.getAttribute('data-channel');
    const text = el.querySelector('.message-text');
    const speaker = el.querySelector<HTMLElement>('.speaker');
    const system = el.classList.contains('system');
    if (!channel || !text || (!system && !speaker)) throw new Error('Invalid log format');
    const name =
      el
        .querySelector('.channel-name')
        ?.textContent?.trim()
        .replace(/^\[|\]$/g, '') ?? titleTab;
    const timestamp = el.querySelector('time')?.getAttribute('datetime');
    const createdAt = timestamp ? Date.parse(timestamp) : undefined;
    if (createdAt !== undefined && !Number.isFinite(createdAt)) throw new Error('Invalid log format');
    return {
      channel,
      ...(createdAt === undefined ? {} : { createdAt }),
      tab: logTab(channel, name),
      character: speaker?.textContent ?? 'system',
      color: speaker?.style.getPropertyValue('--speaker-color') || null,
      message: [text.textContent, el.querySelector('.roll-result')?.textContent].filter(Boolean).join(' ').trim(),
    };
  });
};
