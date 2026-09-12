import { useCallback, useEffect, useState } from 'react';

export const useTimedFeedback = (duration: number) => {
  const [invocation, setInvocation] = useState(0);

  useEffect(() => {
    if (invocation === 0) return;

    const timeout = setTimeout(() => setInvocation(0), duration);
    return () => clearTimeout(timeout);
  }, [duration, invocation]);

  const show = useCallback(() => setInvocation((current) => current + 1), []);

  return { visible: invocation !== 0, show };
};
