'use client';

import { IconMessageReply } from '@tabler/icons-react';
import { t } from 'i18next';
import type { FC } from 'react';
import { useGameSystemRequestDialog } from '@/app/[locale]/(app)/analyze-logs/_components/GameSystemRequest';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { systems } from './hooks/ccfoliaLogAnalysis/messageParser';
import { useLogAnalysisSystem } from './hooks/useLogAnalysis';

export const GameSystemSelect: FC = () => {
  const { system, changeSystem } = useLogAnalysisSystem();
  const { open, render } = useGameSystemRequestDialog();

  return (
    <>
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
          <div className="h-1" />
          <Button variant="outline" onClick={open} className="flex flex-wrap gap-2 w-full">
            <IconMessageReply className="size-5 shrink-0" />
            <span className="text-balance">{t('analyze-logs:game-system-request:label')}</span>
          </Button>
        </SelectContent>
      </Select>
      {render()}
    </>
  );
};
