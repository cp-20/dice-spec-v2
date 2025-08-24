'use client';

import { IconChevronsRight } from '@tabler/icons-react';
import clsx from 'clsx';
import { t } from 'i18next';
import type { FC } from 'react';
import {
  DiceD3,
  DiceD4,
  DiceD6,
  DiceD8,
  DiceD10,
  DiceD12,
  DiceD20,
  DiceD100,
  type DiceProps,
} from '@/shared/components/elements/Dice';
import scrollbarStyles from '@/shared/styles/pretty-scrollbar.module.css';
import type { AvailableDice } from './hooks/useSimpleDiceInput';
import { useSimpleDiceOutput } from './hooks/useSimpleDiceOutput';

export const SimpleDiceOutput: FC = () => {
  const { latestOutput, history } = useSimpleDiceOutput();

  if (latestOutput === null) {
    return <div className="grid h-36 place-content-center text-slate-500">{t('dice:simple.output')}</div>;
  }

  const diceComponentCount = latestOutput.result.reduce((acc, { result }) => {
    return acc + result.length;
  }, 0);
  const animationDelayStep = diceComponentCount > 10 ? 0.3 / diceComponentCount : 0.03;

  return (
    <div>
      <div className="flex flex-wrap items-center min-h-12">
        {latestOutput.result.map(({ dice, result }, i) => {
          const DiceComponent = diceComponents[dice];

          const index = latestOutput.result.slice(0, i).reduce((acc, { result }) => {
            return acc + result.length;
          }, 0);

          return result.map((count, i) => (
            <DiceComponent
              key={`${latestOutput.key}-${dice}-${i}`}
              count={count}
              className="animate-popup opacity-0"
              style={{ animationDelay: `${(index + i) * animationDelayStep}s` }}
            />
          ));
        })}
        <div
          className="flex animate-slide-in-left items-center opacity-0"
          style={{
            animationDelay: `${diceComponentCount * animationDelayStep + 0.2}s`,
          }}
          key={latestOutput.key}
        >
          <IconChevronsRight />
          <div className="text-xl font-bold">{latestOutput.sum}</div>
        </div>
      </div>
      <div className="text-slate-500">{latestOutput.resultStr}</div>
      <div className={clsx('h-16 overflow-auto mt-2', scrollbarStyles['pretty-scrollbar'])}>
        {history
          .toReversed()
          .slice(1)
          .map((output) => (
            <div className="text-slate-300" key={output.key}>
              {output.resultStr}
            </div>
          ))}
      </div>
    </div>
  );
};

export const diceComponents: Record<AvailableDice, FC<DiceProps>> = {
  3: DiceD3,
  4: DiceD4,
  6: DiceD6,
  8: DiceD8,
  10: DiceD10,
  12: DiceD12,
  20: DiceD20,
  100: DiceD100,
};
