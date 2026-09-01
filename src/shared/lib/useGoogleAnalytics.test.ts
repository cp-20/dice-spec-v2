import { afterEach, describe, expect, mock, test } from 'bun:test';

import { sendGoogleAnalyticsEvent } from './useGoogleAnalytics';

describe('sendGoogleAnalyticsEvent', () => {
  afterEach(() => {
    delete window.gtag;
    window.dataLayer = [];
  });

  test('gtag が利用可能ならイベントとパラメータを直接送る', () => {
    const gtag = mock();
    window.gtag = gtag;

    sendGoogleAnalyticsEvent('roll_dice', { mode: 'simple', dice_count: 2 });

    expect(gtag).toHaveBeenCalledWith('event', 'roll_dice', { mode: 'simple', dice_count: 2 });
  });

  test('gtag の読み込み前はイベントをキューに積む', () => {
    sendGoogleAnalyticsEvent('roll_dice');

    expect(window.dataLayer).toEqual([['event', 'roll_dice', {}]]);
  });
});
