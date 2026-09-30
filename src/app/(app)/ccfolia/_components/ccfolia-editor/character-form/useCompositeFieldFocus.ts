import { type ForwardedRef, useImperativeHandle, useRef } from 'react';

export type CompositeFieldFocusHandle = {
  focus: () => void;
};

export const useCompositeFieldFocus = <PrimaryElement extends HTMLElement, FallbackElement extends HTMLElement>(
  forwardedRef: ForwardedRef<CompositeFieldFocusHandle>,
) => {
  const primaryRef = useRef<PrimaryElement>(null);
  const fallbackRef = useRef<FallbackElement>(null);

  useImperativeHandle(
    forwardedRef,
    () => ({
      focus: () => (primaryRef.current ?? fallbackRef.current)?.focus(),
    }),
    [],
  );

  return { primaryRef, fallbackRef };
};
