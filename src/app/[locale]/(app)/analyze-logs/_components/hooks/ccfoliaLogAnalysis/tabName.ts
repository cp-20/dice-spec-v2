const tabNameMap = {
  main: 'メイン',
  info: '情報',
  other: '雑談',
} as const;

export const formatLogTabName = (tab: string) => {
  const bracketedTab = tab.match(/^\[(.+)\]$/);
  const tabName = bracketedTab?.[1] ?? tab;
  const formattedTabName = tabNameMap[tabName as keyof typeof tabNameMap] ?? tabName;

  return bracketedTab ? `[${formattedTabName}]` : formattedTabName;
};
