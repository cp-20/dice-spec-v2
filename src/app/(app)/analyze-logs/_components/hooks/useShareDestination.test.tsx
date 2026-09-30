import { act, renderHook } from '@testing-library/react';
import { Provider } from 'jotai';

import { useShareDestination } from './useShareDestination';

test('初回はXを使い、選んだ共有先を次の起動でも復元できる', () => {
  localStorage.removeItem('analysis-share-destination');
  try {
    const first = renderHook(useShareDestination, { wrapper: Provider });
    expect(first.result.current[0]).toBe('X');
    act(() => first.result.current[1]('Bluesky'));
    expect(first.result.current[0]).toBe('Bluesky');
    expect(JSON.parse(localStorage.getItem('analysis-share-destination')!)).toBe('Bluesky');
    first.unmount();

    const second = renderHook(useShareDestination, { wrapper: Provider });
    expect(second.result.current[0]).toBe('Bluesky');
    act(() => second.result.current[1]('X'));
    second.unmount();

    const third = renderHook(useShareDestination, { wrapper: Provider });
    expect(third.result.current[0]).toBe('X');
    third.unmount();
  } finally {
    localStorage.removeItem('analysis-share-destination');
  }
});
