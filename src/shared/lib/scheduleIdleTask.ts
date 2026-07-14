export const scheduleIdleTask = (task: () => void, timeout: number, delay = 0) => {
  let cancelIdle: (() => void) | undefined;
  const schedule = () => {
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(task, { timeout });
      cancelIdle = () => window.cancelIdleCallback(id);
      return;
    }

    const id = setTimeout(task, timeout);
    cancelIdle = () => clearTimeout(id);
  };

  const delayId = window.setTimeout(schedule, delay);
  return () => {
    window.clearTimeout(delayId);
    cancelIdle?.();
  };
};
