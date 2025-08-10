import clsx from 'clsx';
import type { ComponentProps, FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import D3 from '/public/assets/images/D3.svg';
import D4 from '/public/assets/images/D4.svg';
import D6 from '/public/assets/images/D6.svg';
import D8 from '/public/assets/images/D8.svg';
import D12 from '/public/assets/images/D12.svg';
import D20 from '/public/assets/images/D20.svg';
import styles from './Dice.module.css';

export type DiceProps = {
  count: number;
} & ComponentProps<'div'>;

export const DiceD3: FC<DiceProps> = ({ count, className, ...props }) => (
  <div className={twMerge('relative inline-grid size-12 select-none place-content-center', className)} {...props}>
    <D3 className={clsx('mt-[0.1rem] size-12', styles['dice-image'])} />
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-semibold">{count}</div>
  </div>
);

export const DiceD4: FC<DiceProps> = ({ count, className, ...props }) => (
  <div className={twMerge('relative inline-grid size-12 select-none place-content-center', className)} {...props}>
    <D4 className={clsx('mt-[0.1rem] size-12', styles['dice-image'])} />
    <div className="absolute left-1/2 top-1/2 inline-grid size-5 -translate-x-1/2 -translate-y-1/2 place-content-center rounded-full bg-white text-lg font-semibold">
      {count}
    </div>
  </div>
);

export const DiceD6: FC<DiceProps> = ({ count, className, ...props }) => (
  <div className={twMerge('relative -mt-1 inline-grid size-12 select-none place-content-center', className)} {...props}>
    <D6 className={clsx('mb-[0.15rem] size-9', styles['dice-image'])} />
    <div className="absolute left-1/2 top-[calc(50%-0.1rem)] inline-grid size-5 -translate-x-1/2 -translate-y-1/2 place-content-center text-lg font-semibold">
      {count}
    </div>
  </div>
);

export const DiceD8: FC<DiceProps> = ({ count, className, ...props }) => (
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

export const DiceD10: FC<DiceProps> = ({ count, ...props }) => <DiceD10Base count={count} {...props} />;

export const DiceD12: FC<DiceProps> = ({ count, className, ...props }) => (
  <div className={twMerge('relative inline-grid size-12 select-none place-content-center', className)} {...props}>
    <D12 className={clsx('mb-1 size-10', styles['dice-image'])} />
    <div className="absolute left-1/2 top-[calc(50%-0.15rem)] inline-grid size-5 -translate-x-1/2 -translate-y-1/2 place-content-center rounded-full bg-white text-lg font-semibold">
      {count}
    </div>
  </div>
);

export const DiceD20: FC<DiceProps> = ({ count, ...props }) => <DiceD10Base count={count} {...props} />;

export const DiceD100: FC<DiceProps> = ({ count, className, ...props }) => (
  <div className={twMerge('h-12', className)} {...props}>
    <DiceD10Base count={count === 100 ? '00' : `0${Math.floor(count / 10)}`} />
    <DiceD10Base count={count % 10} className="-ml-3" />
  </div>
);
