import { useEffect } from 'react';

import { isBillingInterval, PRO_PRICE_JPY } from '@/features/stripe/contract';
import { useToast } from '@/shared/components/ui/use-toast';
import { sendGoogleAnalyticsEvent } from '@/shared/lib/useGoogleAnalytics';

// Stripe Checkout の完了後の戻り先 (`/profile?session_id=...&interval=...`) で、購入を計測して完了を伝える。
export const useCheckoutCompletion = () => {
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (!sessionId) return;

    const interval = params.get('interval');
    const value = isBillingInterval(interval) ? PRO_PRICE_JPY[interval] : undefined;
    const sent = sendGoogleAnalyticsEvent('purchase', {
      transaction_id: sessionId,
      currency: 'JPY',
      value,
      items: [{ item_id: `pro_${interval}`, item_name: 'Pro', price: value, quantity: 1 }],
    });
    // 計測できたときだけクエリを消し、再読み込みで二重に計測しないようにする。GA も同じ transaction_id の purchase は重複として扱う。
    if (sent) window.history.replaceState(window.history.state, '', window.location.pathname);
    toast({
      title: 'PROプランへの登録が完了しました',
      description: '反映まで数秒かかることがあります',
    });
  }, [toast]);
};
