'use client';

import { IconLoader2, IconSettings, IconSparkles } from '@tabler/icons-react';
import { t } from 'i18next';
import { useState } from 'react';

import { ContainerSection } from '@/app/[locale]/(app)/_components/ContainerSection';
import { useMeStore } from '@/features/account/firebase/accountStore';
import { createPortalSession } from '@/features/stripe/api';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useToast } from '@/shared/components/ui/use-toast';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';

import { PricingCards } from './PricingCards';

export const PlanManagementSection = () => {
  const { authUser } = useFirebaseAuth();
  const { me } = useMeStore();
  const { toast } = useToast();
  const [managingSubscription, setManagingSubscription] = useState(false);

  const handleOpenPortal = async () => {
    if (me === null) return;

    if (!me.stripeCustomerId) {
      toast({
        title: t('profile:toast.manage-subscription-error-title'),
        description: t('profile:toast.manage-subscription-error-no-customer'),
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

      window.location.href = data.url;
    } catch (error) {
      console.error('Error opening subscription portal:', error);
      toast({
        title: t('profile:toast.manage-subscription-error-title'),
        description: t('profile:toast.manage-subscription-error-description'),
        variant: 'destructive',
      });
    } finally {
      setManagingSubscription(false);
    }
  };

  return (
    <ContainerSection label={t('profile:plan.title')} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg">
          <div className="flex items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t('profile:plan.current-plan')}</span>
                {me === null ? (
                  <Skeleton className="h-6 w-20 rounded-full" />
                ) : me.plan === 'pro' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                    <IconSparkles className="size-3" />
                    {t('profile:plan.pro')}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-slate-600 bg-slate-200 px-2 py-1 rounded-full">
                    {t('profile:plan.free')}
                  </span>
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
                    <span>{t('profile:plan.loading')}</span>
                  </>
                ) : (
                  <>
                    <IconSettings className="size-4" />
                    <span>{t('profile:plan.manage-subscription')}</span>
                  </>
                )}
              </Button>
              <p className="text-xs text-slate-600">{t('profile:plan.manage-subscription-note')}</p>
            </div>
          )}
        </div>

        {me !== null && me.plan === 'free' && <>{authUser && <PricingCards />}</>}
      </div>
    </ContainerSection>
  );
};
