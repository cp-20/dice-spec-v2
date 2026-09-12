'use client';

import { IconLoader2, IconSettings, IconSparkles } from '@tabler/icons-react';
import { useState } from 'react';

import { ContainerSection } from '@/app/(app)/_components/ContainerSection';
import { useMeStore } from '@/features/account/firebase/accountStore';
import { createPortalSession } from '@/features/stripe/api';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useToast } from '@/shared/components/ui/use-toast';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';
import { captureClientException } from '@/shared/lib/sentryClient';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

import { PricingCards } from './PricingCards';

export const PlanManagementSection = () => {
  const { authUser } = useFirebaseAuth();
  const { me } = useMeStore();
  const { toast } = useToast();
  const [managingSubscription, setManagingSubscription] = useState(false);
  const { sendEventBeforeNavigation } = useGoogleAnalytics();

  const handleOpenPortal = async () => {
    if (me === null) return;

    if (!me.stripeCustomerId) {
      toast({
        title: 'サブスクリプション管理に失敗しました',
        description: '契約情報が見つかりませんでした',
        variant: 'destructive',
      });
      return;
    }

    setManagingSubscription(true);
    try {
      const data = await createPortalSession();

      if (!data.url) {
        throw new Error('Stripe portal URL not found');
      }

      sendEventBeforeNavigation('open_billing_portal', {}, () => {
        setManagingSubscription(false);
        window.location.href = data.url;
      });
    } catch (error) {
      console.error('Error opening subscription portal:', error);
      captureClientException(error);
      toast({
        title: 'サブスクリプション管理に失敗しました',
        description: 'もう一度お試しください',
        variant: 'destructive',
      });
      setManagingSubscription(false);
    }
  };

  return (
    <ContainerSection label="プラン管理" className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg">
          <div className="flex items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">現在のプラン</span>
                {me === null ? (
                  <Skeleton className="h-6 w-20 rounded-full" />
                ) : me.plan === 'pro' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                    <IconSparkles className="size-3" />
                    プロ
                  </span>
                ) : (
                  <span className="text-xs font-medium text-slate-600 bg-slate-200 px-2 py-1 rounded-full">フリー</span>
                )}
              </div>
            </div>
          </div>

          {me?.plan === 'pro' && (
            <div className="flex flex-col items-end gap-2">
              <Button
                onClick={handleOpenPortal}
                disabled={managingSubscription}
                variant="outline"
                size="sm"
                className="px-3"
              >
                {managingSubscription ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin" />
                    <span>読み込み中</span>
                  </>
                ) : (
                  <>
                    <IconSettings className="size-4" />
                    <span>Stripeでサブスクリプションを管理する</span>
                  </>
                )}
              </Button>
              <p className="text-xs text-slate-600">
                外部サイト (Stripe) へ移動します。プラン変更や解約は遷移先で行えます。
              </p>
            </div>
          )}
        </div>

        {me !== null && me.plan === 'free' && <>{authUser && <PricingCards />}</>}
      </div>
    </ContainerSection>
  );
};
