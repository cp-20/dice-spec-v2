'use client';

import { IconChevronsRight } from '@tabler/icons-react';
import clsx from 'clsx';
import { t } from 'i18next';
import type { ComponentProps, FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import scrollbarStyles from '@/shared/styles/pretty-scrollbar.module.css';
import D3 from '/public/assets/images/D3.svg';
import D4 from '/public/assets/images/D4.svg';
import D6 from '/public/assets/images/D6.svg';
import D8 from '/public/assets/images/D8.svg';
import D12 from '/public/assets/images/D12.svg';
import D20 from '/public/assets/images/D20.svg';
import type { AvailableDice } from './hooks/useSimpleDiceInput';
import { useSimpleDiceOutput } from './hooks/useSimpleDiceOutput';
import styles from './SimpleDiceOutput.module.css';

export const SimpleDiceOutput: FC = () => {
  const { latestOutput, history } = useSimpleDiceOutput();

  if (latestOutput === null) {
    return <div className="grid h-36 place-content-center text-slate-400">{t('dice:simple.output')}</div>;
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

type DiceProps = {
  count: number;
} & ComponentProps<'div'>;

const DiceD3: FC<DiceProps> = ({ count, className, ...props }) => (
  <div className={twMerge('relative inline-grid size-12 select-none place-content-center', className)} {...props}>
    <D3 className={clsx('mt-[0.1rem] size-12', styles['dice-image'])} />
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-semibold">{count}</div>
  </div>
);

const DiceD4: FC<DiceProps> = ({ count, className, ...props }) => (
  <div className={twMerge('relative inline-grid size-12 select-none place-content-center', className)} {...props}>
    <D4 className={clsx('mt-[0.1rem] size-12', styles['dice-image'])} />
    <div className="absolute left-1/2 top-1/2 inline-grid size-5 -translate-x-1/2 -translate-y-1/2 place-content-center rounded-full bg-white text-lg font-semibold">
      {count}
    </div>
  </div>
);

const DiceD6: FC<DiceProps> = ({ count, className, ...props }) => (
  <div className={twMerge('relative -mt-1 inline-grid size-12 select-none place-content-center', className)} {...props}>
    <D6 className={clsx('mb-[0.15rem] size-9', styles['dice-image'])} />
    <div className="absolute left-1/2 top-[calc(50%-0.1rem)] inline-grid size-5 -translate-x-1/2 -translate-y-1/2 place-content-center text-lg font-semibold">
      {count}
    </div>
  </div>
);

const DiceD8: FC<DiceProps> = ({ count, className, ...props }) => (
  <div className={twMerge('relative inline-grid size-12 select-none place-content-center', className)} {...props}>
    <D8 className={clsx('mb-1 size-10', styles['dice-image'])} />
    <div className="absolute left-1/2 top-[calc(50%-0.15rem)] inline-grid size-5 -translate-x-1/2 -translate-y-1/2 place-content-center rounded-full bg-white text-lg font-semibold">
      {count}
    </div>
  </div>
);

const DiceD10Base: FC<{ count: ReactNode } & ComponentProps<'div'>> = ({ count, className, ...props }) => (
  <div className={twMerge('relative inline-grid size-12 select-none place-content-center', className)} {...props}>
    <D20 className={clsx('mb-1 size-10', styles['dice-image'])} />
    <div className="absolute left-1/2 top-[calc(50%-0.15rem)] inline-grid size-5 -translate-x-1/2 -translate-y-1/2 place-content-center rounded-full bg-white text-lg font-semibold">
      {count}
    </div>
  </div>
);

const DiceD10: FC<DiceProps> = ({ count, ...props }) => <DiceD10Base count={count} {...props} />;

const DiceD12: FC<DiceProps> = ({ count, className, ...props }) => (
  <div className={twMerge('relative inline-grid size-12 select-none place-content-center', className)} {...props}>
    <D12 className={clsx('mb-1 size-10', styles['dice-image'])} />
    <div className="absolute left-1/2 top-[calc(50%-0.15rem)] inline-grid size-5 -translate-x-1/2 -translate-y-1/2 place-content-center rounded-full bg-white text-lg font-semibold">
      {count}
    </div>
  </div>
);

const DiceD20: FC<DiceProps> = ({ count, ...props }) => <DiceD10Base count={count} {...props} />;

const DiceD100: FC<DiceProps> = ({ count, className, ...props }) => (
  <div className={twMerge('h-12', className)} {...props}>
    <DiceD10Base count={count === 100 ? '00' : `0${Math.floor(count / 10)}`} />
    <DiceD10Base count={count % 10} className="-ml-3" />
  </div>
);

const diceComponents: Record<AvailableDice, FC<DiceProps>> = {
  3: DiceD3,
  4: DiceD4,
  6: DiceD6,
  8: DiceD8,
  10: DiceD10,
  12: DiceD12,
  20: DiceD20,
  100: DiceD100,
};
