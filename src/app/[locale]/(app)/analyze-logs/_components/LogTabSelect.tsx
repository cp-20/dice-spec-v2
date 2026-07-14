'use client';

import { t } from 'i18next';
import type { FC } from 'react';

import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';

import { formatLogTabName } from '@/features/log-analysis/ccfolia/tabName';
import { useLogTabSelect } from './hooks/useLogAnalysis';

export const LogTabSelect: FC = () => {
  const { tabs, enabledTabs, toggleTab, setAllTabsSelected } = useLogTabSelect();
  const enabled = tabs.length > 0;
  const allSelected = enabled && enabledTabs.length === tabs.length;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-bold block">{t('analyze-logs:tab-select.label')}</Label>
      <div className="rounded-md border border-input bg-background p-3 shadow-xs">
        {enabled ? (
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex min-h-8 items-center gap-2 rounded-sm px-2 py-1 text-sm font-medium">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => setAllTabsSelected(checked === true)}
                aria-label={t('analyze-logs:tab-select.all')}
              />
              <span>{t('analyze-logs:tab-select.all')}</span>
            </label>
            {tabs.map((tab) => (
              <label
                key={tab}
                className="inline-flex min-h-8 items-center gap-2 rounded-sm px-2 py-1 text-sm font-medium"
              >
                <Checkbox
                  checked={enabledTabs.includes(tab)}
                  onCheckedChange={() => toggleTab(tab)}
                  aria-label={formatLogTabName(tab)}
                />
                <span>{formatLogTabName(tab)}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500">{t('analyze-logs:tab-select.empty')}</div>
        )}
      </div>
    </div>
  );
};
