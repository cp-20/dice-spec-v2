import { afterEach, describe, expect, mock, test } from 'bun:test';

import { sendGoogleAnalyticsEvent, sendGoogleAnalyticsEventBeforeNavigation } from './useGoogleAnalytics';

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

    expect(Array.from(window.dataLayer[0] as IArguments)).toEqual(['event', 'roll_dice', {}]);
  });

  test('計測エラーを業務処理へ伝播させない', () => {
    const originalConsoleError = console.error;
    console.error = () => undefined;
    window.gtag = () => {
      throw new Error('gtag failed');
    };

    try {
      expect(sendGoogleAnalyticsEvent('roll_dice')).toBe(false);
    } finally {
      console.error = originalConsoleError;
    }
  });

  test('外部遷移はイベント処理後に一度だけ実行する', () => {
    let parameters: Record<string, unknown> = {};
    window.gtag = mock((_command, _event, nextParameters) => {
      parameters = nextParameters as Record<string, unknown>;
    });
    const navigate = mock();

    sendGoogleAnalyticsEventBeforeNavigation('begin_checkout', { value: 300 }, navigate);
    (parameters.event_callback as () => void)();
    (parameters.event_callback as () => void)();

    expect(parameters.transport_type).toBe('beacon');
    expect(parameters.event_timeout).toBe(2000);
    expect(navigate).toHaveBeenCalledTimes(1);
  });
});
