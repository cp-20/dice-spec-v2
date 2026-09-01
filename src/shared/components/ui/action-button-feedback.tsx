import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/shadcn-utils';

export type ActionButtonState = 'idle' | 'pending' | 'success';

type ActionButtonFeedbackProps = {
  state: ActionButtonState;
  idle: ReactNode;
  pending?: ReactNode;
  success: ReactNode;
};

export const ActionButtonFeedback = ({ state, idle, pending, success }: ActionButtonFeedbackProps) => {
  const states = [
    { key: 'idle' as const, content: idle },
    ...(pending === undefined ? [] : [{ key: 'pending' as const, content: pending }]),
    { key: 'success' as const, content: success },
  ];

  return (
    <span className="relative grid min-w-0 place-items-center overflow-y-clip">
      {states.map(({ key, content }) => (
        <span
          key={key}
          aria-hidden={key !== state}
          className={cn(
            'col-start-1 row-start-1 inline-flex items-center justify-center gap-2 motion-reduce:animate-none',
            key === 'idle' && state === 'idle' && 'animate-slide-in-top motion-reduce:opacity-100',
            key === 'idle' && state !== 'idle' && 'animate-slide-out-bottom motion-reduce:opacity-0',
            key !== 'idle' && key === state && 'animate-popup opacity-0 motion-reduce:opacity-100',
            key !== 'idle' && key !== state && 'pointer-events-none opacity-0',
          )}
        >
          {content}
        </span>
      ))}
    </span>
  );
};
