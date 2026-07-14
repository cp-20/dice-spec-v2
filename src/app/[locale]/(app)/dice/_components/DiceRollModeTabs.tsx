'use client';

import clsx from 'clsx';
import { t } from 'i18next';
import dynamic from 'next/dynamic';
import { type FC, type ReactNode, useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

type DiceRollModeTabsProps = {
  simpleTabContent: ReactNode;
};

const AdvancedDiceRollPanel = dynamic(
  () => import('./AdvancedDiceRollPanel').then((mod) => mod.AdvancedDiceRollPanel),
  { ssr: false, loading: () => <div className="min-h-40 animate-pulse rounded-md bg-slate-100" /> },
);

export const DiceRollModeTabs: FC<DiceRollModeTabsProps> = ({ simpleTabContent }) => {
  const [value, setValue] = useState('simple');

  return (
    <Tabs value={value} onValueChange={(value) => setValue(value)}>
      <TabsList
        className={clsx(
          'duration-400 relative mb-8 before:absolute before:left-1 before:h-[calc(100%-8px)] before:w-[calc(50%-4px)] before:rounded-sm before:bg-white before:transition-all before:ease-out',
          value === 'simple' && 'before:translate-x-0',
          value === 'advanced' && 'before:translate-x-full',
        )}
      >
        <TabsTrigger className="z-10 data-[state=active]:bg-transparent data-[state=active]:shadow-none" value="simple">
          {t('dice:simple.label')}
        </TabsTrigger>
        <TabsTrigger
          className="z-10 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          value="advanced"
        >
          {t('dice:advanced.label')}
        </TabsTrigger>
      </TabsList>
      <TabsContent className={clsx(value === 'simple' && 'animate-slide-in-right')} value="simple">
        {simpleTabContent}
      </TabsContent>
      <TabsContent className={clsx(value === 'advanced' && 'animate-slide-in-left')} value="advanced">
        {value === 'advanced' && <AdvancedDiceRollPanel />}
      </TabsContent>
    </Tabs>
  );
};
