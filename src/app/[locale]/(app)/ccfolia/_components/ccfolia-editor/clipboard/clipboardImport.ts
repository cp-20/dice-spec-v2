import { t } from 'i18next';
import { atom } from 'jotai';
import { ValiError } from 'valibot';

import { parseCcfoliaClipboardCharacter } from '@/features/ccfolia/model';
import { toast } from '@/shared/components/ui/use-toast';
import { authUserAtom } from '@/shared/lib/firebase/useFirebaseAuth';
import { captureClientException } from '@/shared/lib/sentryClient';
import { sendGoogleAnalyticsEvent } from '@/shared/lib/useGoogleAnalytics';

import { formPortAtom } from '../character-form/editorForm';
import {
  confirmDiscardChanges,
  remoteConflictAtom,
  resetEditorAsUnsavedNew,
  selectionAtom,
} from '../saved-characters/savedCharacters';

export const loadClipboardCharacterAtom = atom(null, async (get, set): Promise<boolean> => {
  const form = get(formPortAtom);
  if (!form) return false;

  const operationUid = get(authUserAtom)?.uid ?? null;
  const operationIsCurrent = () => (get(authUserAtom)?.uid ?? null) === operationUid && get(formPortAtom) === form;
  try {
    const text = await navigator.clipboard.readText();
    if (!operationIsCurrent()) return false;
    const character = parseCcfoliaClipboardCharacter(text);
    if (!operationIsCurrent() || !confirmDiscardChanges(get)) return false;
    set(selectionAtom, { characterId: null, revision: null });
    set(remoteConflictAtom, null);
    resetEditorAsUnsavedNew(form, character);
    sendGoogleAnalyticsEvent('load_ccfolia_character');
    return true;
  } catch (loadError) {
    if (!operationIsCurrent()) return false;
    console.error('CCFOLIA_CLIPBOARD_LOAD_FAILED');
    if (loadError instanceof SyntaxError || loadError instanceof ValiError) {
      sendGoogleAnalyticsEvent('load_ccfolia_character_error', { reason: 'invalid_clipboard' });
    } else {
      captureClientException(loadError);
    }
    toast({
      title: t('ccfolia:load-clipboard.error'),
      description: t('ccfolia:load-clipboard.error-description'),
      variant: 'destructive',
    });
    return false;
  }
});
