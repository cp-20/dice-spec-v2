import { beforeEach, describe, expect, mock, test, vi } from 'bun:test';

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Timestamp } from 'firebase/firestore';
import { atom, getDefaultStore, type Atom } from 'jotai';
import { withAtomEffect } from 'jotai-effect';

import {
  createDefaultCcfoliaEditorCharacter,
  type CcfoliaCharacterData,
  type CcfoliaCharacterDocument,
  stringifyCcfoliaClipboardCharacter,
} from '@/features/ccfolia/model';

import { retainNavigationFallbackDraft, takeNavigationFallbackDraft } from './navigation/navigationFallbackDraft';

const character: CcfoliaCharacterDocument = {
  id: 'loaded-page-character',
  schemaVersion: 1,
  revision: 1,
  name: '追加ページの探索者',
  memo: '',
  initiative: null,
  externalUrl: '',
  status: [],
  params: [],
  color: '#888888',
  commands: '',
  createdAt: Timestamp.fromMillis(0),
  updatedAt: Timestamp.fromMillis(0),
};
const staleCharacter: CcfoliaCharacterDocument = {
  ...character,
  id: 'stale-character',
  name: 'リモート削除済み',
};
const sameNameCharacter: CcfoliaCharacterDocument = {
  ...character,
  id: 'same-name-character',
};

class TestCcfoliaCharacterNotFoundError extends Error {}
class TestCcfoliaCharacterConflictError extends Error {}

let listedCharacterIds = new Set([character.id]);
const testCharactersRevisionAtom = atom(0);
const setListedCharacterIds = (ids: Iterable<string> = []) => {
  listedCharacterIds = new Set(ids);
  getDefaultStore().set(testCharactersRevisionAtom, (current) => current + 1);
};
let remotelyExists = true;
let hasMoreCharacters = false;
let remoteTargetCharacterId: string | null | undefined;
let remoteCharacter: CcfoliaCharacterDocument | null | undefined;
const loadMoreCharacters = vi.fn();
const createCharacter = vi.fn();
const updateCharacter = vi.fn();
const deleteCharacter = vi.fn();
const toastMock = vi.fn();
const sendGoogleAnalyticsEvent = vi.fn();
const remoteQueryListeners = new Set<() => void>();
const testAuthUserAtom = atom<{ uid: string } | null>({ uid: 'user-1' });
const testAuthUserLoadingAtom = atom(false);
const testMeAtom = atom({ id: 'user-1', plan: 'free' as const, ccfoliaCharacterCount: 1 });
const testMeLoadingAtom = atom(false);
const emitRemoteQuery = () => {
  for (const listener of remoteQueryListeners) listener();
};

mock.module('@/features/account/firebase/accountStore', () => ({
  meAtom: testMeAtom,
  meLoadingAtom: testMeLoadingAtom,
  useMeStore: () => ({
    me: { id: 'user-1', plan: 'free', ccfoliaCharacterCount: 1 },
    meLoading: false,
  }),
}));
mock.module('@/features/ccfolia/firebase/characters', () => ({
  createCcfoliaCharactersQueryAtoms: (authUserAtom: Atom<{ uid: string } | null | undefined>) => {
    const charactersAtom = atom((get) => {
      get(testCharactersRevisionAtom);
      return {
        characters: get(authUserAtom)
          ? [character, staleCharacter, sameNameCharacter].filter(({ id }) => listedCharacterIds.has(id))
          : [],
        loading: false,
        loadingMore: false,
        hasMore: hasMoreCharacters,
        error: null,
      };
    });
    return {
      charactersAtom,
      loadMoreAtom: atom(null, () => loadMoreCharacters()),
    };
  },
  createCcfoliaCharacterQueryAtom: (
    authUserAtom: Atom<{ uid: string } | null | undefined>,
    characterIdAtom: Atom<string | null>,
  ) => {
    const valueAtom = atom({
      ownerUid: null as string | null,
      characterId: null as string | null,
      character: null as CcfoliaCharacterDocument | null,
      exists: null as boolean | null,
      loading: false,
      error: null as Error | null,
    });
    return withAtomEffect(valueAtom, (get, set) => {
      const uid = get(authUserAtom)?.uid ?? null;
      const characterId = get(characterIdAtom);
      const update = () => {
        const responseCharacterId = remoteTargetCharacterId === undefined ? characterId : remoteTargetCharacterId;
        const responseCharacter =
          remoteCharacter === undefined
            ? ([character, staleCharacter, sameNameCharacter].find(({ id }) => id === responseCharacterId) ?? null)
            : remoteCharacter;
        set(valueAtom, {
          ownerUid: uid,
          characterId: responseCharacterId,
          character: characterId && remotelyExists ? responseCharacter : null,
          exists: characterId ? remotelyExists : null,
          loading: false,
          error: null,
        });
      };
      remoteQueryListeners.add(update);
      update();
      return () => remoteQueryListeners.delete(update);
    });
  },
}));
mock.module('@/features/ccfolia/firebase/mutations', () => ({
  CcfoliaCharacterConflictError: TestCcfoliaCharacterConflictError,
  CcfoliaCharacterLimitError: class extends Error {},
  CcfoliaCharacterNotFoundError: TestCcfoliaCharacterNotFoundError,
  createCcfoliaCharacterAtom: atom(null, (_get, _set, data: CcfoliaCharacterData) => createCharacter(data)),
  updateCcfoliaCharacterAtom: atom(
    null,
    (_get, _set, input: { characterId: string; expectedRevision: number; data: CcfoliaCharacterData }) =>
      updateCharacter(input.characterId, input.expectedRevision, input.data),
  ),
  deleteCcfoliaCharacterAtom: atom(null, (_get, _set, input: { characterId: string; expectedRevision: number }) =>
    deleteCharacter(input.characterId, input.expectedRevision),
  ),
}));
mock.module('@/shared/lib/firebase/useFirebaseAuth', () => ({
  authUserAtom: testAuthUserAtom,
  authUserLoadingAtom: testAuthUserLoadingAtom,
  useFirebaseAuth: () => ({
    authUser: getDefaultStore().get(testAuthUserAtom),
    loading: getDefaultStore().get(testAuthUserLoadingAtom),
  }),
}));
mock.module('@/shared/components/ui/use-toast', () => ({
  toast: toastMock,
  useToast: () => ({ toast: toastMock }),
}));
mock.module('@/shared/lib/useGoogleAnalytics', () => ({
  sendGoogleAnalyticsEvent,
  useGoogleAnalytics: () => ({ sendEvent: sendGoogleAnalyticsEvent }),
}));
describe('CcfoliaEditor', () => {
  beforeEach(() => {
    setListedCharacterIds([character.id]);
    getDefaultStore().set(testAuthUserAtom, { uid: 'user-1' });
    getDefaultStore().set(testAuthUserLoadingAtom, false);
    getDefaultStore().set(testMeAtom, { id: 'user-1', plan: 'free', ccfoliaCharacterCount: 1 });
    getDefaultStore().set(testMeLoadingAtom, false);
    hasMoreCharacters = false;
    loadMoreCharacters.mockClear();
    remotelyExists = true;
    remoteTargetCharacterId = undefined;
    remoteCharacter = undefined;
    toastMock.mockClear();
    sendGoogleAnalyticsEvent.mockClear();
    takeNavigationFallbackDraft('user-1');
  });

  test('フォーム接続前に認証が確定しても退避した編集内容を復元する', async () => {
    retainNavigationFallbackDraft({
      uid: 'user-1',
      character: { ...createDefaultCcfoliaEditorCharacter(), name: '退避した編集内容' },
      selectedCharacterId: null,
      selectedRevision: null,
    });
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    render(<CcfoliaEditor />);

    await waitFor(() => expect((screen.getByLabelText('名前') as HTMLInputElement).value).toBe('退避した編集内容'));
  });

  test('クリップボード読取待ちで編集された場合は反映直前に破棄確認する', async () => {
    setListedCharacterIds();
    let resolveClipboard!: (value: string) => void;
    const readText = vi.spyOn(navigator.clipboard, 'readText').mockImplementationOnce(
      () =>
        new Promise<string>((resolve) => {
          resolveClipboard = resolve;
        }),
    );
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    render(<CcfoliaEditor />);

    fireEvent.click(screen.getByRole('button', { name: 'クリップボードから読み込む' }));
    const nameInput = screen.getByLabelText('名前') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '読取待ちの編集' } });
    resolveClipboard(
      stringifyCcfoliaClipboardCharacter({ ...createDefaultCcfoliaEditorCharacter(), name: 'クリップボード' }),
    );

    await waitFor(() => expect(confirmSpy).toHaveBeenCalledTimes(1));
    expect(nameInput.value).toBe('読取待ちの編集');
    readText.mockRestore();
    confirmSpy.mockRestore();
  });

  test('クリップボード読取中に認証セッションが変わったら遅延応答を適用しない', async () => {
    setListedCharacterIds();
    let resolveClipboard!: (value: string) => void;
    const readText = vi.spyOn(navigator.clipboard, 'readText').mockImplementationOnce(
      () =>
        new Promise<string>((resolve) => {
          resolveClipboard = resolve;
        }),
    );
    const confirmSpy = vi.spyOn(window, 'confirm');
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    render(<CcfoliaEditor />);

    fireEvent.click(screen.getByRole('button', { name: 'クリップボードから読み込む' }));
    act(() => getDefaultStore().set(testAuthUserAtom, { uid: 'user-2' }));
    resolveClipboard(
      stringifyCcfoliaClipboardCharacter({ ...createDefaultCcfoliaEditorCharacter(), name: '以前のセッション' }),
    );

    await waitFor(() => expect(screen.getByRole('button', { name: 'クリップボードから読み込む' })).toBeTruthy());
    expect((screen.getByLabelText('名前') as HTMLInputElement).value).toBe('');
    expect(confirmSpy).not.toHaveBeenCalled();
    readText.mockRestore();
    confirmSpy.mockRestore();
  });

  test('切替前のリモート応答を切替後のキャラクターへ適用しない', async () => {
    setListedCharacterIds([character.id, staleCharacter.id]);
    remotelyExists = true;
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    const view = render(<CcfoliaEditor />);

    fireEvent.click(screen.getByRole('button', { name: /^追加ページの探索者/ }));
    fireEvent.click(screen.getByRole('button', { name: /^リモート削除済み/ }));
    remoteTargetCharacterId = character.id;
    remoteCharacter = { ...character, revision: 99, name: '遅れて届いた旧キャラクター' };
    act(() => emitRemoteQuery());

    view.rerender(<CcfoliaEditor />);
    await waitFor(() => expect((screen.getByLabelText('名前') as HTMLInputElement).value).toBe(staleCharacter.name));
    expect(screen.queryByText('遅れて届いた旧キャラクター')).toBeNull();
  });

  test('ログアウト時に編集中のフォームを初期化する', async () => {
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    render(<CcfoliaEditor />);
    const nameInput = screen.getByLabelText('名前') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '編集中' } });

    act(() => getDefaultStore().set(testAuthUserAtom, null));

    await waitFor(() => expect(nameInput.value).toBe(''));
  });

  test('再マウント時に前回の選択状態を引き継がない', async () => {
    setListedCharacterIds([character.id]);
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    const firstView = render(<CcfoliaEditor />);

    fireEvent.click(screen.getByRole('button', { name: /^追加ページの探索者/ }));
    expect((screen.getByLabelText('名前') as HTMLInputElement).value).toBe(character.name);
    firstView.unmount();

    render(<CcfoliaEditor />);
    await waitFor(() => expect((screen.getByLabelText('名前') as HTMLInputElement).value).toBe(''));
  });

  test('追加読込ページの選択キャラが別タブで削除されたら編集内容を保ってカードを除外する', async () => {
    setListedCharacterIds([character.id]);
    remotelyExists = true;
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    const view = render(<CcfoliaEditor />);

    fireEvent.click(screen.getByRole('button', { name: /^追加ページの探索者/ }));
    expect(confirmSpy).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
    const nameInput = screen.getByLabelText('名前') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '編集中の名前' } });

    remotelyExists = false;
    act(() => emitRemoteQuery());
    view.rerender(<CcfoliaEditor />);

    await waitFor(() => expect(screen.queryByText(character.name)).toBeNull());
    expect(nameInput.value).toBe('編集中の名前');
    expect(screen.getByText('このキャラクターは別のタブまたは端末で削除されたか、読み込めない状態です。')).toBeTruthy();
    expect(screen.getByRole('button', { name: '現在の内容を新規として編集' })).toBeTruthy();

    view.rerender(<CcfoliaEditor />);
    expect(screen.queryByText(character.name)).toBeNull();
  });

  test('選択中のカードを個別購読の最新版へ置き換える', async () => {
    setListedCharacterIds([character.id]);
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    const view = render(<CcfoliaEditor />);

    fireEvent.click(screen.getByRole('button', { name: /^追加ページの探索者/ }));
    remoteCharacter = { ...character, revision: 2, name: '別タブで更新された探索者' };
    act(() => emitRemoteQuery());
    view.rerender(<CcfoliaEditor />);

    await waitFor(() => expect(screen.getByText('別タブで更新された探索者')).toBeTruthy());
    expect(screen.queryByText(character.name)).toBeNull();
  });

  test('別キャラの編集中に削除済みカードを削除しても編集内容を保つ', async () => {
    setListedCharacterIds([character.id, staleCharacter.id]);
    remotelyExists = true;
    deleteCharacter.mockReset();
    deleteCharacter.mockRejectedValueOnce(new TestCcfoliaCharacterNotFoundError());
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    const view = render(<CcfoliaEditor />);

    fireEvent.click(screen.getByRole('button', { name: /^追加ページの探索者/ }));
    const nameInput = screen.getByLabelText('名前') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '保持する編集内容' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: `削除: ${staleCharacter.name}` }));
    });

    expect(deleteCharacter).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(staleCharacter.name)).toBeNull();
    expect(nameInput.value).toBe('保持する編集内容');
    view.rerender(<CcfoliaEditor />);
    expect(screen.queryByText(staleCharacter.name)).toBeNull();
    expect(nameInput.value).toBe('保持する編集内容');
    confirmSpy.mockRestore();
  });

  test('同じキャラクターの二重削除だけを防ぐ', async () => {
    setListedCharacterIds([character.id]);
    deleteCharacter.mockReset();
    let resolveDelete!: () => void;
    deleteCharacter.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveDelete = resolve;
        }),
    );
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    render(<CcfoliaEditor />);

    const deleteButton = screen.getByRole('button', { name: `削除: ${character.name}` });
    fireEvent.click(deleteButton);
    fireEvent.click(deleteButton);

    await waitFor(() => expect(deleteCharacter).toHaveBeenCalledTimes(1));
    expect((screen.getByLabelText('名前') as HTMLInputElement).disabled).toBe(false);
    await act(async () => {
      resolveDelete();
    });
    expect(screen.queryByText(character.name)).toBeNull();
    confirmSpy.mockRestore();
  });

  test('異なるキャラクターを並行して削除できる', async () => {
    setListedCharacterIds([character.id, staleCharacter.id]);
    deleteCharacter.mockReset();
    const deleteResolvers = new Map<string, () => void>();
    deleteCharacter.mockImplementation(
      (characterId: string) =>
        new Promise<void>((resolve) => {
          deleteResolvers.set(characterId, resolve);
        }),
    );
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    render(<CcfoliaEditor />);

    fireEvent.click(screen.getByRole('button', { name: `削除: ${character.name}` }));
    fireEvent.click(screen.getByRole('button', { name: `削除: ${staleCharacter.name}` }));

    await waitFor(() => expect(deleteCharacter).toHaveBeenCalledTimes(2));
    expect(deleteResolvers.size).toBe(2);
    await act(async () => {
      deleteResolvers.get(character.id)?.();
      deleteResolvers.get(staleCharacter.id)?.();
    });
    expect(screen.queryByText(character.name)).toBeNull();
    expect(screen.queryByText(staleCharacter.name)).toBeNull();
    confirmSpy.mockRestore();
  });

  test('同名のキャラクターを続けて削除しても操作ごとに成功を通知する', async () => {
    setListedCharacterIds([character.id, sameNameCharacter.id]);
    deleteCharacter.mockReset();
    deleteCharacter.mockResolvedValue(undefined);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    const view = render(<CcfoliaEditor />);

    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: `削除: ${character.name}` })[0]!);
    });
    expect(screen.getAllByRole('button', { name: `削除: ${character.name}` })).toHaveLength(1);
    const firstAnnouncement = screen.getByText(`${character.name}を削除しました`);

    view.rerender(<CcfoliaEditor />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: `削除: ${character.name}` }));
    });
    expect(screen.queryAllByRole('button', { name: `削除: ${character.name}` })).toHaveLength(0);

    expect(screen.getByText(`${character.name}を削除しました`)).not.toBe(firstAnnouncement);
    confirmSpy.mockRestore();
  });

  test('カラーの入力途中もライブ出力を止めず、有効値へ戻せる', async () => {
    setListedCharacterIds();
    remotelyExists = true;
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    render(<CcfoliaEditor />);
    const colorInput = screen.getByRole('textbox', { name: 'チャットカラーの16進カラーコード' });
    const result = screen.getByRole('textbox', { name: '出力結果' }) as HTMLTextAreaElement;

    fireEvent.change(colorInput, { target: { value: '#88888' } });
    await waitFor(() => expect(result.value).toContain('"color":"#88888"'));

    fireEvent.change(colorInput, { target: { value: '#123abc' } });
    await waitFor(() => expect(result.value).toContain('"color":"#123abc"'));
  });

  test('保存済みキャラクターでは新規保存と上書き保存を分けて表示する', async () => {
    setListedCharacterIds([character.id]);
    remotelyExists = true;
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    render(<CcfoliaEditor />);

    expect(screen.getByRole('heading', { name: '保存済みキャラクターを選択して入力' })).toBeTruthy();
    expect(screen.getByText('または')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'クリップボードから読み込む' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'アカウントに新規保存' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '上書き保存' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /^追加ページの探索者/ }));

    expect(sendGoogleAnalyticsEvent).toHaveBeenCalledWith('load_saved_ccfolia_character');
    expect((screen.getByRole('button', { name: 'アカウントに新規保存' }) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole('button', { name: '上書き保存' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByText('保存済みです')).toBeNull();
    expect(screen.queryByText('新しいキャラクターを編集中です')).toBeNull();
  });

  test('追加ページの読み込みをキャラクター一覧の取得元へ直接要求する', async () => {
    setListedCharacterIds([character.id]);
    hasMoreCharacters = true;
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    render(<CcfoliaEditor />);

    fireEvent.click(screen.getByRole('button', { name: '保存済みキャラクターをさらに読み込む' }));

    expect(loadMoreCharacters).toHaveBeenCalledTimes(1);
  });

  test('保存中の追加入力を未保存に保ちつつ、保存完了を操作元へ表示する', async () => {
    setListedCharacterIds([character.id]);
    remotelyExists = true;
    updateCharacter.mockReset();
    let resolveUpdate!: (revision: number) => void;
    updateCharacter.mockImplementationOnce(
      () =>
        new Promise<number>((resolve) => {
          resolveUpdate = resolve;
        }),
    );
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    render(<CcfoliaEditor />);

    fireEvent.click(screen.getByRole('button', { name: /^追加ページの探索者/ }));
    const nameInput = screen.getByLabelText('名前') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '保存対象' } });
    fireEvent.click(screen.getByRole('button', { name: '上書き保存' }));

    await waitFor(() => expect(updateCharacter).toHaveBeenCalledTimes(1));
    expect(nameInput.disabled).toBe(false);
    fireEvent.change(nameInput, { target: { value: '保存中に追記' } });
    resolveUpdate(2);

    await waitFor(() => expect(screen.getByRole('button', { name: '保存しました' })).toBeTruthy());
    expect(nameInput.value).toBe('保存中に追記');
  });

  test('異なるキャラクターの上書き保存を並行でき、先の完了で現在の編集を上書きしない', async () => {
    setListedCharacterIds([character.id, staleCharacter.id]);
    remotelyExists = true;
    updateCharacter.mockReset();
    const updateResolvers = new Map<string, (revision: number) => void>();
    updateCharacter.mockImplementation(
      (characterId: string) =>
        new Promise<number>((resolve) => {
          updateResolvers.set(characterId, resolve);
        }),
    );
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    render(<CcfoliaEditor />);

    fireEvent.click(screen.getByRole('button', { name: /^追加ページの探索者/ }));
    const nameInput = screen.getByLabelText('名前') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '先に保存する編集' } });
    fireEvent.click(screen.getByRole('button', { name: '上書き保存' }));
    await waitFor(() => expect(updateCharacter).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /^リモート削除済み/ }));
    await waitFor(() => expect(nameInput.value).toBe(staleCharacter.name));
    fireEvent.change(nameInput, { target: { value: '後から保存する編集' } });
    fireEvent.click(screen.getByRole('button', { name: '上書き保存' }));

    await waitFor(() => expect(updateCharacter).toHaveBeenCalledTimes(2));
    await act(async () => updateResolvers.get(staleCharacter.id)?.(2));
    expect(nameInput.value).toBe('後から保存する編集');

    await act(async () => updateResolvers.get(character.id)?.(2));
    expect(nameInput.value).toBe('後から保存する編集');
    confirmSpy.mockRestore();
  });

  test('切替前のキャラクターの保存競合を現在の選択として通知しない', async () => {
    setListedCharacterIds([character.id, staleCharacter.id]);
    updateCharacter.mockReset();
    let rejectUpdate!: (error: Error) => void;
    updateCharacter.mockImplementationOnce(
      () =>
        new Promise<number>((_resolve, reject) => {
          rejectUpdate = reject;
        }),
    );
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    render(<CcfoliaEditor />);

    fireEvent.click(screen.getByRole('button', { name: /^追加ページの探索者/ }));
    fireEvent.change(screen.getByLabelText('名前'), { target: { value: '保存対象' } });
    fireEvent.click(screen.getByRole('button', { name: '上書き保存' }));
    await waitFor(() => expect(updateCharacter).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /^リモート削除済み/ }));
    await act(async () => rejectUpdate(new TestCcfoliaCharacterConflictError()));

    expect(toastMock).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  test('保存中も同じキャラクターの削除とクリップボード読込を独立して実行できる', async () => {
    setListedCharacterIds([character.id]);
    remotelyExists = true;
    updateCharacter.mockReset();
    let resolveUpdate!: (revision: number) => void;
    updateCharacter.mockImplementationOnce(
      () =>
        new Promise<number>((resolve) => {
          resolveUpdate = resolve;
        }),
    );
    deleteCharacter.mockReset();
    deleteCharacter.mockResolvedValueOnce(undefined);
    const readText = vi
      .spyOn(navigator.clipboard, 'readText')
      .mockResolvedValueOnce(
        stringifyCcfoliaClipboardCharacter({ ...createDefaultCcfoliaEditorCharacter(), name: '読み込んだキャラ' }),
      );
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    render(<CcfoliaEditor />);

    fireEvent.click(screen.getByRole('button', { name: /^追加ページの探索者/ }));
    const nameInput = screen.getByLabelText('名前') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '保存待ち' } });
    fireEvent.click(screen.getByRole('button', { name: '上書き保存' }));
    await waitFor(() => expect(updateCharacter).toHaveBeenCalledTimes(1));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: `削除: ${character.name}` }));
    });
    expect(deleteCharacter).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'クリップボードから読み込む' }));
    await waitFor(() => expect(nameInput.value).toBe('読み込んだキャラ'));
    expect(sendGoogleAnalyticsEvent).toHaveBeenCalledWith('delete_saved_ccfolia_character');
    expect(sendGoogleAnalyticsEvent).toHaveBeenCalledWith('load_ccfolia_character');
    await act(async () => resolveUpdate(2));
    expect(nameInput.value).toBe('読み込んだキャラ');
    readText.mockRestore();
    confirmSpy.mockRestore();
  });

  test('保存完了後に遅れて失敗した削除で競合状態へ戻さない', async () => {
    setListedCharacterIds([character.id]);
    updateCharacter.mockReset();
    deleteCharacter.mockReset();
    let resolveUpdate!: (revision: number) => void;
    let rejectDelete!: (error: Error) => void;
    updateCharacter.mockImplementationOnce(
      () =>
        new Promise<number>((resolve) => {
          resolveUpdate = resolve;
        }),
    );
    deleteCharacter.mockImplementationOnce(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectDelete = reject;
        }),
    );
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    render(<CcfoliaEditor />);

    fireEvent.click(screen.getByRole('button', { name: /^追加ページの探索者/ }));
    fireEvent.change(screen.getByLabelText('名前'), { target: { value: '保存対象' } });
    fireEvent.click(screen.getByRole('button', { name: `削除: ${character.name}` }));
    fireEvent.click(screen.getByRole('button', { name: '上書き保存' }));
    await waitFor(() => {
      expect(updateCharacter).toHaveBeenCalledTimes(1);
      expect(deleteCharacter).toHaveBeenCalledTimes(1);
    });

    await act(async () => resolveUpdate(2));
    await act(async () => rejectDelete(new TestCcfoliaCharacterConflictError()));

    expect(
      screen.queryByText('このキャラクターは別のタブまたは端末で更新されました。現在の内容はまだ失われていません。'),
    ).toBeNull();
    expect(toastMock).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  test('保存完了後は操作元のボタンで成功を表示する', async () => {
    setListedCharacterIds([character.id]);
    remotelyExists = true;
    updateCharacter.mockReset();
    updateCharacter.mockResolvedValueOnce(2);
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    render(<CcfoliaEditor />);

    fireEvent.click(screen.getByRole('button', { name: /^追加ページの探索者/ }));
    fireEvent.change(screen.getByLabelText('名前'), { target: { value: '保存対象' } });
    fireEvent.click(screen.getByRole('button', { name: '上書き保存' }));

    await waitFor(() => expect(screen.getByRole('button', { name: '保存しました' })).toBeTruthy());
    expect(sendGoogleAnalyticsEvent).toHaveBeenCalledWith('save_ccfolia_character', {
      action: 'overwrite',
    });
  });

  test('同じキャラクターを連続で出力しても最新の操作から成功表示時間を数える', async () => {
    vi.useFakeTimers();
    setListedCharacterIds([character.id]);
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    render(<CcfoliaEditor />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: `エクスポート: ${character.name}` }));
    });
    act(() => vi.advanceTimersByTime(1_000));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: `コピーしました: ${character.name}` }));
    });
    act(() => vi.advanceTimersByTime(600));

    expect(screen.getByRole('button', { name: `コピーしました: ${character.name}` })).toBeTruthy();
    expect(sendGoogleAnalyticsEvent).toHaveBeenCalledWith('export_saved_ccfolia_character');
    writeText.mockRestore();
  });

  test('同名キャラクターにも識別用のキーを表示しない', async () => {
    setListedCharacterIds([character.id, sameNameCharacter.id]);
    remotelyExists = true;
    const { CcfoliaEditor } = await import('./CcfoliaEditor');
    render(<CcfoliaEditor />);

    expect(screen.getAllByText(character.name)).toHaveLength(2);
    expect(screen.queryByText(character.id.slice(0, 6))).toBeNull();
    expect(screen.queryByText(sameNameCharacter.id.slice(0, 6))).toBeNull();
  });
});
