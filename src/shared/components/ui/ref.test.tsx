import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from './button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';
import { Input } from './input';

test('asChildで親と子のrefを同じDOMへ接続し、破棄時にcleanupを呼ぶ', () => {
  const parentRef = createRef<HTMLButtonElement>();
  const cleanup = vi.fn<() => void>();
  const childRef = vi.fn<(element: HTMLButtonElement) => () => void>(() => cleanup);
  const { unmount } = render(
    <Button asChild ref={parentRef}>
      <button ref={childRef}>実行</button>
    </Button>,
  );

  const button = screen.getByRole('button', { name: '実行' });
  expect(parentRef.current).toBe(button);
  expect(childRef).toHaveBeenCalledWith(button);
  unmount();
  expect(parentRef.current).toBeNull();
  expect(cleanup).toHaveBeenCalledOnce();
});

test('フォーム検証でFormControlとInputを通してエラーのある入力へフォーカスする', async () => {
  const onSubmit = vi.fn<() => void>();
  const TestForm = () => {
    const form = useForm({ defaultValues: { name: '' } });
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            rules={{ required: '名前を入力してください' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>名前</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">保存</Button>
        </form>
      </Form>
    );
  };
  render(<TestForm />);

  fireEvent.click(screen.getByRole('button', { name: '保存' }));
  expect((await screen.findByRole('alert')).textContent).toBe('名前を入力してください');
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('textbox', { name: '名前' })));
  expect(onSubmit).not.toHaveBeenCalled();
});
