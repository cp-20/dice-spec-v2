'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { type ComponentProps, forwardRef, type MouseEvent, Suspense, useEffect, useRef, useState } from 'react';

const START_EVENT = 'dice-spec:navigation-progress-start';
const COMPLETE_EVENT = 'dice-spec:navigation-progress-complete';

export const startNavigationProgress = () => window.dispatchEvent(new Event(START_EVENT));

export const shouldStartNavigation = (
  event: MouseEvent<HTMLAnchorElement>,
  current: Pick<Location, 'href' | 'origin' | 'pathname' | 'search'> = window.location,
) => {
  const link = event.currentTarget;
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    link.hasAttribute('download') ||
    (link.target && link.target !== '_self')
  ) {
    return false;
  }

  const destination = new URL(link.href, current.href);
  return (
    destination.origin === current.origin &&
    (destination.pathname !== current.pathname || destination.search !== current.search)
  );
};

export type ProgressLinkProps = ComponentProps<typeof Link>;

export const ProgressLink = forwardRef<HTMLAnchorElement, ProgressLinkProps>(({ onClick, ...props }, ref) => (
  <Link
    {...props}
    ref={ref}
    onClick={(event) => {
      onClick?.(event);
      if (shouldStartNavigation(event)) startNavigationProgress();
    }}
  />
));
ProgressLink.displayName = 'ProgressLink';

type ProgressStatus = 'idle' | 'starting' | 'running' | 'complete';

const NavigationProgressInner = () => {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [status, setStatus] = useState<ProgressStatus>('idle');
  const statusRef = useRef<ProgressStatus>('idle');

  useEffect(() => {
    let frame: number | undefined;
    let timeout: number | undefined;
    let hideTimeout: number | undefined;

    const update = (next: ProgressStatus) => {
      statusRef.current = next;
      setStatus(next);
    };
    const clearScheduled = () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.clearTimeout(hideTimeout);
    };
    const complete = () => {
      if (statusRef.current === 'idle') return;
      clearScheduled();
      update('complete');
      hideTimeout = window.setTimeout(() => update('idle'), 200);
    };
    const start = () => {
      clearScheduled();
      update('starting');
      frame = requestAnimationFrame(() => update('running'));
      timeout = window.setTimeout(complete, 10_000);
    };

    window.addEventListener(START_EVENT, start);
    window.addEventListener(COMPLETE_EVENT, complete);
    window.addEventListener('popstate', start);
    return () => {
      clearScheduled();
      window.removeEventListener(START_EVENT, start);
      window.removeEventListener(COMPLETE_EVENT, complete);
      window.removeEventListener('popstate', start);
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(new Event(COMPLETE_EVENT));
  }, [pathname, search]);

  const scale = status === 'complete' ? 1 : status === 'running' ? 0.85 : 0.08;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] transition-opacity duration-150 ${status === 'idle' ? 'opacity-0' : 'opacity-100'}`}
    >
      <div
        className="h-full w-full origin-left bg-slate-700 shadow-[0_0_8px_#334155]"
        style={{
          transform: `scaleX(${scale})`,
          transitionDuration: status === 'running' ? '10s' : status === 'complete' ? '150ms' : '0ms',
          transitionProperty: 'transform',
          transitionTimingFunction: status === 'running' ? 'cubic-bezier(0.1, 0.5, 0.2, 1)' : 'ease-out',
        }}
      />
    </div>
  );
};

export const NavigationProgress = () => (
  <Suspense fallback={null}>
    <NavigationProgressInner />
  </Suspense>
);
