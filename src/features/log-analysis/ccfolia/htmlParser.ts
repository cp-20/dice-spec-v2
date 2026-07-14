type StructuredLog = {
  color: string | null;
  tab: string;
  character: string;
  message: string;
};

let cachedHtml = '';
let cachedLogs: StructuredLog[] = [];

// input: html 形式のログ
// output: 構造化されたログ
export const parseHtmlLog = (html: string): StructuredLog[] => {
  if (html === cachedHtml) return cachedLogs;

  const parser = new DOMParser();

  const doc = parser.parseFromString(html, 'text/html');
  const logElements = Array.from(doc.querySelectorAll('body > p'));

  const logs = logElements.map((el) => {
    const spanElements = Array.from(el.getElementsByTagName('span'));
    const textContents = spanElements.map((el) => el.innerText);
    if (textContents.length < 3) {
      throw new Error('Invalid log format');
    }
    const [tab, character, message] = textContents;
    // color:#012345; -> #012345
    const color = el.getAttribute('style')?.slice(6, -1) ?? null;

    return { color, tab: tab.trim(), character, message: message.trim() };
  });

  cachedHtml = html;
  cachedLogs = logs;
  return logs;
};
