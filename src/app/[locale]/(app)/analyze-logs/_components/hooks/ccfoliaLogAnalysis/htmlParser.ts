export type StructuredLog = {
  color: string | null;
  tab: string;
  character: string;
  message: string;
};

// input: html 形式のログ
// output: 構造化されたログ
export const parseHtmlLog = (html: string): StructuredLog[] => {
  const parser = new DOMParser();

  const doc = parser.parseFromString(html, 'text/html');
  const logElements = Array.from(doc.querySelectorAll('body > p'));

  const logs = logElements.map((el) => {
    const spanElements = Array.from(el.getElementsByTagName('span'));
    const textContents = spanElements.map((el) => el.innerText);
    const [tab, character, message] = textContents;
    // color:#012345; -> #012345
    const color = el.getAttribute('style')?.slice(6, -1) ?? null;

    return { color, tab: tab.trim(), character, message: message.trim() };
  });

  return logs;
};
