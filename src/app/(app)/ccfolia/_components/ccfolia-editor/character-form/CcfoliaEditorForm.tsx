'use client';

import { useAtomValue, useSetAtom } from 'jotai';
import { type FC, useEffect, useMemo } from 'react';

import { reportInvalidEditor, saveCharacterAtom } from '../character-save/characterSave';
import { selectionAtom } from '../saved-characters/savedCharacters';
import { CCFOLIA_EDITOR_FORM_ID, editorContentVersionAtom, syncEditorFormAtom } from './editorForm';
import { InputForm } from './InputForm';
import { ResultView } from './ResultView';
import { useInputForm } from './useInputForm';

export const CcfoliaEditorForm: FC = () => {
  const { form, formResult, characterName } = useInputForm();
  const selectedCharacterId = useAtomValue(selectionAtom).characterId;
  const advanceEditorContentVersion = useSetAtom(editorContentVersionAtom);
  const syncForm = useSetAtom(syncEditorFormAtom);
  const saveCharacter = useSetAtom(saveCharacterAtom);

  const formPort = useMemo(
    () => ({
      getValues: () => form.getValues(),
      reset: (...args: Parameters<typeof form.reset>) => {
        advanceEditorContentVersion((current) => current + 1);
        form.reset(...args);
      },
      submit: (
        onValid: Parameters<typeof form.handleSubmit>[0],
        onInvalid: NonNullable<Parameters<typeof form.handleSubmit>[1]>,
      ) => {
        void form.handleSubmit(onValid, onInvalid)();
      },
    }),
    [advanceEditorContentVersion, form],
  );

  useEffect(() => {
    syncForm({
      port: formPort,
      characterName,
      isDirty: form.formState.isDirty,
    });
  }, [characterName, form.formState.isDirty, formPort, syncForm]);

  return (
    <>
      <InputForm
        form={form}
        formId={CCFOLIA_EDITOR_FORM_ID}
        onSubmit={(editor) =>
          saveCharacter({
            editor,
            intent: selectedCharacterId ? 'overwrite' : 'create',
          })
        }
        onInvalid={reportInvalidEditor}
      />
      <ResultView formResult={formResult} />
    </>
  );
};
