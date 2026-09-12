import { atom } from 'jotai';

import type { CcfoliaEditorCharacter } from '@/features/ccfolia/model';

export const CCFOLIA_EDITOR_FORM_ID = 'ccfolia-editor-form';

export type EditorFormPort = {
  getValues: () => CcfoliaEditorCharacter;
  reset: (values: CcfoliaEditorCharacter, options?: { keepDefaultValues?: boolean; keepValues?: boolean }) => void;
  submit: (onValid: (editor: CcfoliaEditorCharacter) => void | Promise<void>, onInvalid: () => void) => void;
};

export const formPortAtom = atom<EditorFormPort | null>(null);
export const formSnapshotAtom = atom({ characterName: '', isDirty: false });
export const editorContentVersionAtom = atom(0);

// React Hook Form が正本のため、フォーム外の操作に必要な命令とスナップショットだけを接続する。
export const syncEditorFormAtom = atom(
  null,
  (_get, set, { port, characterName, isDirty }: { port: EditorFormPort; characterName: string; isDirty: boolean }) => {
    set(formPortAtom, port);
    set(formSnapshotAtom, (current) => {
      if (current.characterName === characterName && current.isDirty === isDirty) return current;
      return { characterName, isDirty };
    });
  },
);
