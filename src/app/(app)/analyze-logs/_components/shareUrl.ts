export type ShareDestination = 'X' | 'Bluesky';

export const getShareUrl = (destination: ShareDestination, text: string, url: string) =>
  destination === 'X'
    ? `https://twitter.com/intent/tweet?${new URLSearchParams({ text, url })}`
    : `https://bsky.app/intent/compose?${new URLSearchParams({ text: `${text}\n${url}` })}`;
