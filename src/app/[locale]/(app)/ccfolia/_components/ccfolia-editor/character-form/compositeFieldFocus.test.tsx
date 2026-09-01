import { expect, test, vi } from 'bun:test';

import { act, render } from '@testing-library/react';
import { createRef, type ReactElement, type Ref } from 'react';

import { ParameterInput } from './ParameterInput';
import { StatusInput } from './StatusInput';
import type { CompositeFieldFocusHandle } from './useCompositeFieldFocus';

const expectCompositeFieldFocus = (
  populatedElement: (ref: Ref<CompositeFieldFocusHandle>) => ReactElement,
  emptyElement: (ref: Ref<CompositeFieldFocusHandle>) => ReactElement,
) => {
  const populatedRef = createRef<CompositeFieldFocusHandle>();
  const populated = render(populatedElement(populatedRef));
  act(() => populatedRef.current?.focus());
  expect(document.activeElement).toBe(populated.container.querySelector('input'));
  populated.unmount();

  const emptyRef = createRef<CompositeFieldFocusHandle>();
  const empty = render(emptyElement(emptyRef));
  act(() => emptyRef.current?.focus());
  expect(document.activeElement).toBe(empty.container.querySelector('button'));
  empty.unmount();
};

test('ステータス欄は先頭入力へフォーカスし、空なら追加操作へフォールバックする', () => {
  const onChange = vi.fn();
  expectCompositeFieldFocus(
    (ref) => <StatusInput ref={ref} value={[{ key: 'status-1', label: 'HP', value: 1, max: 1 }]} onChange={onChange} />,
    (ref) => <StatusInput ref={ref} value={[]} onChange={onChange} />,
  );
});

test('パラメータ欄は先頭入力へフォーカスし、空なら追加操作へフォールバックする', () => {
  const onChange = vi.fn();
  expectCompositeFieldFocus(
    (ref) => <ParameterInput ref={ref} value={[{ key: 'param-1', label: 'STR', value: '50' }]} onChange={onChange} />,
    (ref) => <ParameterInput ref={ref} value={[]} onChange={onChange} />,
  );
});
