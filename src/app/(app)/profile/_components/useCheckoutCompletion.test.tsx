import { renderHook } from '@testing-library/react';

import { useCheckoutCompletion } from './useCheckoutCompletion';

const purchaseEvents = () =>
  window.dataLayer.map((event) => Array.from(event as ArrayLike<unknown>)).filter((event) => event[1] === 'purchase');

// Stripe からの戻り先の URL を再現する。
const setURL = (url: string) =>
  (window as unknown as { happyDOM: { setURL: (url: string) => void } }).happyDOM.setURL(url);

test('決済完了の戻り先で購入を一度だけ計測し、クエリを消す', () => {
  window.dataLayer = [];
  setURL('http://localhost/profile?session_id=cs_test_1&interval=yearly');

  renderHook(useCheckoutCompletion).unmount();
  // 再読み込みや再マウントでは計測しない。
  renderHook(useCheckoutCompletion).unmount();

  expect(window.location.search).toBe('');
  expect(purchaseEvents()).toEqual([
    [
      'event',
      'purchase',
      {
        transaction_id: 'cs_test_1',
        currency: 'JPY',
        value: 3000,
        items: [{ item_id: 'pro_yearly', item_name: 'Pro', price: 3000, quantity: 1 }],
      },
    ],
  ]);
});

test('決済を経由しない表示では計測しない', () => {
  window.dataLayer = [];
  setURL('http://localhost/profile');

  renderHook(useCheckoutCompletion).unmount();

  expect(purchaseEvents()).toEqual([]);
});
