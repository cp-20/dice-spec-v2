'use client';

import { IconChevronsRight } from '@tabler/icons-react';
import clsx from 'clsx';
import Image from 'next/image';
import type { ComponentProps, FC, ReactNode } from 'react';
import D3 from '/public/assets/images/D3.svg';
import D4 from '/public/assets/images/D4.svg';
import D6 from '/public/assets/images/D6.svg';
import D8 from '/public/assets/images/D8.svg';
import D12 from '/public/assets/images/D12.svg';
import D20 from '/public/assets/images/D20.svg';
import { twMerge } from 'tailwind-merge';

import styles from './SimpleDiceOutput.module.css';
import type { AvailableDice } from '@/app/(app)/dice/_components/hooks/useSimpleDiceInput';
import { useSimpleDiceOutput } from '@/app/(app)/dice/_components/hooks/useSimpleDiceOutput';

export const SimpleDiceOutput: FC = () => {
  const { simpleDiceOutput } = useSimpleDiceOutput();

  if (simpleDiceOutput === null) {
    return (
      <div className="grid min-h-[5rem] place-content-center text-slate-400">
        ここに結果が表示されます
      </div>
    );
  }

  const diceComponentCount = simpleDiceOutput.result.reduce(
    (acc, { result }) => {
      return acc + result.length;
    },
    0,
  );
  const animationDelayStep =
    diceComponentCount > 10 ? 0.3 / diceComponentCount : 0.03;

  return (
    <div className="min-h-[5rem]">
      <div className="flex flex-wrap items-center">
        {simpleDiceOutput.result.map(({ dice, result }, i) => {
          const DiceComponent = diceComponents[dice];

          const index = simpleDiceOutput.result
            .slice(0, i)
            .reduce((acc, { result }) => {
              return acc + result.length;
            }, 0);

          return result.map((count, i) => (
            <DiceComponent
              key={`${simpleDiceOutput.key}-${dice}-${i}`}
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
          key={simpleDiceOutput.key}
        >
          <IconChevronsRight />
          <div className="text-xl font-bold">{simpleDiceOutput.sum}</div>
        </div>
      </div>
      <div className="text-slate-400">{simpleDiceOutput.resultStr}</div>
    </div>
  );
};

type DiceProps = {
  count: number;
} & ComponentProps<'div'>;

export const DiceD3: FC<DiceProps> = ({ count, className, ...props }) => (
  <div
    className={twMerge(
      'relative inline-block h-12 w-12 select-none',
      className,
    )}
    {...props}
  >
    <Image
      src={D3}
      alt=""
      width={48}
      height={48}
      loading="eager"
      className={clsx('mt-[0.1rem]', styles['dice-image'])}
    />
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-semibold">
      {count}
    </div>
  </div>
);

export const DiceD4: FC<DiceProps> = ({ count, className, ...props }) => (
  <div
    className={twMerge(
      'relative inline-block h-12 w-12 select-none',
      className,
    )}
    {...props}
  >
    <Image
      src={D4}
      alt=""
      width={48}
      height={48}
      loading="eager"
      className={clsx('mt-[0.1rem]', styles['dice-image'])}
    />
    <div className="absolute left-1/2 top-1/2 inline-grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-content-center rounded-full bg-white text-lg font-semibold">
      {count}
    </div>
  </div>
);

export const DiceD6: FC<DiceProps> = ({ count, className, ...props }) => (
  <div
    className={twMerge(
      'relative -mt-1 inline-flex h-12 w-12 select-none items-center justify-center',
      className,
    )}
    {...props}
  >
    <Image
      src={D6}
      alt=""
      width={32}
      height={32}
      loading="eager"
      className={styles['dice-image']}
    />
    <div className="absolute left-1/2 top-1/2 inline-grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-content-center text-lg font-semibold">
      {count}
    </div>
  </div>
);

export const DiceD8: FC<DiceProps> = ({ count, className, ...props }) => (
  <div
    className={twMerge(
      'relative inline-block h-12 w-12 select-none',
      className,
    )}
    {...props}
  >
    <Image
      src={D8}
      alt=""
      width={40}
      height={40}
      loading="eager"
      className={clsx('ml-1 mt-1', styles['dice-image'])}
    />
    <div className="absolute left-1/2 top-1/2 inline-grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-content-center rounded-full bg-white text-lg font-semibold">
      {count}
    </div>
  </div>
);

export const DiceD10Base: FC<{ count: ReactNode } & ComponentProps<'div'>> = ({
  count,
  className,
  ...props
}) => (
  <div
    className={twMerge(
      'relative inline-block h-12 w-12 select-none',
      className,
    )}
    {...props}
  >
    <Image
      src={D20}
      alt=""
      width={40}
      height={40}
      loading="eager"
      className={clsx('ml-1 mt-1', styles['dice-image'])}
    />
    <div className="absolute left-1/2 top-1/2 inline-grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-content-center rounded-full bg-white text-lg font-semibold">
      {count}
    </div>
  </div>
);

export const DiceD10: FC<DiceProps> = ({ count, ...props }) => (
  <DiceD10Base count={count} {...props} />
);

export const DiceD12: FC<DiceProps> = ({ count, className, ...props }) => (
  <div
    className={twMerge(
      'relative inline-block h-12 w-12 select-none',
      className,
    )}
    {...props}
  >
    <Image
      src={D12}
      alt=""
      width={40}
      height={40}
      loading="eager"
      className={clsx('ml-1 mt-1', styles['dice-image'])}
    />
    <div className="absolute left-1/2 top-1/2 inline-grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-content-center rounded-full bg-white text-lg font-semibold">
      {count}
    </div>
  </div>
);

export const DiceD20: FC<DiceProps> = ({ count, ...props }) => (
  <DiceD10Base count={count} {...props} />
);

export const DiceD100: FC<DiceProps> = ({ count, className, ...props }) => (
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
