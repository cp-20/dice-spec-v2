'use client';

import { IconCheck, IconLoader2 } from '@tabler/icons-react';
import { t } from 'i18next';
import { useState } from 'react';
import { createCheckoutSession } from '@/features/stripe/api';
import { CustomLink } from '@/shared/components/elements/CustomLink';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/use-toast';
import { cn } from '@/shared/lib/shadcn-utils';
import type { BillingInterval } from '@/shared/lib/stripe/config';

const MONTHLY_PRICE = 300;
const YEARLY_PRICE = 3000;
const yearlyMonthlyEquivalent = Math.floor(YEARLY_PRICE / 12);
const yearlyDiscountPercentage = Math.floor(((MONTHLY_PRICE - yearlyMonthlyEquivalent) / MONTHLY_PRICE) * 100);
const yearlyOriginalPrice = MONTHLY_PRICE * 12;
const yearlySaving = yearlyOriginalPrice - YEARLY_PRICE;

export const PricingCards = () => {
  const { toast } = useToast();
  const [interval, setInterval] = useState<BillingInterval>('yearly');
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const data = await createCheckoutSession({ interval });
      window.location.href = data.url;
    } catch (error) {
      console.error('Error upgrading:', error);
      toast({
        title: t('profile:toast.upgrade-error-title'),
        description: t('profile:toast.upgrade-error-description'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-center text-slate-900">{t('profile:pricing.title')}</h2>

      <div className="mx-auto flex w-fit items-center rounded-lg border border-slate-200 bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setInterval('monthly')}
          className={cn(
            'rounded-md px-5 py-2 text-sm font-semibold transition-colors',
            interval === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900',
          )}
        >
          {t('profile:pricing.billing-monthly')}
        </button>
        <button
          type="button"
          onClick={() => setInterval('yearly')}
          className={cn(
            'relative rounded-md px-5 py-2 text-sm font-semibold transition-colors',
            interval === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900',
          )}
        >
          {t('profile:pricing.billing-yearly')}
          <span className="absolute -right-2 -top-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
            -{yearlyDiscountPercentage}%
          </span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                {t('profile:pricing.plan-name')}
              </div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold leading-none text-slate-900">
                  ¥{interval === 'monthly' ? MONTHLY_PRICE : yearlyMonthlyEquivalent}
                </span>
                <span className="pb-1 text-sm text-slate-600">/{t('profile:pricing.month')}</span>
              </div>
            </div>

            <div className="rounded-md bg-slate-100 px-3 py-2 text-right text-xs text-slate-700">
              <div className="font-semibold">
                {interval === 'monthly'
                  ? t('profile:pricing.monthly-payment')
                  : t('profile:pricing.yearly-payment', { price: `${YEARLY_PRICE}` })}
              </div>
              {interval === 'yearly' && (
                <div className="mt-1 text-[11px] font-medium text-slate-600">
                  <span className="mr-1 line-through">¥{yearlyOriginalPrice}</span>
                  <span className="text-blue-700">-¥{yearlySaving}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
              <div className="rounded-full bg-blue-100 p-1 mt-0.5">
                <IconCheck className="size-4 text-blue-700" />
              </div>
              <div>
                <div className="font-medium text-slate-900">{t('profile:pricing.feature-unlimited-saves')}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
              <div className="rounded-full bg-blue-100 p-1 mt-0.5">
                <IconCheck className="size-4 text-blue-700" />
              </div>
              <div className="font-medium text-slate-900">{t('profile:pricing.feature-advanced-analytics')}</div>
            </div>
          </div>

          <Button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full h-12 text-base font-semibold rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
            size="lg"
          >
            {loading ? (
              <>
                <IconLoader2 className="size-5 animate-spin" />
                <span>{t('profile:pricing.processing')}</span>
              </>
            ) : (
              <>
                <span>{t('profile:pricing.upgrade-button')}</span>
                <span className="ml-1">→</span>
              </>
            )}
          </Button>

          <p className="text-center text-xs leading-relaxed text-slate-500">
            {t('profile:pricing.legal-note-prefix')}
            <CustomLink
              href={t('link', { href: '/specified-commercial-transactions' })}
              className="underline underline-offset-2 hover:text-slate-700"
            >
              {t('profile:pricing.legal-link-label')}
            </CustomLink>
            {t('profile:pricing.legal-note-suffix')}
          </p>
        </div>
      </div>
    </div>
  );
};
