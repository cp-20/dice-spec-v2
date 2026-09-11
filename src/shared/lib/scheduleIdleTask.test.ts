import { scheduleIdleTask } from './scheduleIdleTask';

test('idle callbackを優先する', async () => {
  const originalRequest = window.requestIdleCallback;
  const originalCancel = window.cancelIdleCallback;
  const request = vi.fn(() => 42);
  const cancel = vi.fn(() => undefined);
  window.requestIdleCallback = request;
  window.cancelIdleCallback = cancel;

  try {
    const task = () => undefined;
    scheduleIdleTask(task, 8_000);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(request).toHaveBeenCalledWith(task, { timeout: 8_000 });
  } finally {
    window.requestIdleCallback = originalRequest;
    window.cancelIdleCallback = originalCancel;
  }
});
