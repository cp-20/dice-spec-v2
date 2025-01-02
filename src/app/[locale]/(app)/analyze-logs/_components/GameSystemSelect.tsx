'use client';

import type { FC } from 'react';
import { useLogAnalysisSystem } from './hooks/useLogAnalysis';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/components/ui/select';
import { t } from 'i18next';
import { systems } from './hooks/ccfoliaLogAnalysis/messageParser';

export const GameSystemSelect: FC = () => {
  const { system, changeSystem } = useLogAnalysisSystem();

  return (
    <Select value={system ?? undefined} onValueChange={changeSystem}>
      <SelectTrigger className="w-full font-bold" aria-label={t('analyze-logs:game-system-select.label')}>
        <SelectValue
          placeholder={<span className="text-slate-500">{t('analyze-logs:game-system-select.label')}</span>}
        />
      </SelectTrigger>
      <SelectContent>
        {Object.values(systems).map((system) => (
          <SelectItem key={system.id} value={system.id}>
            {system.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
