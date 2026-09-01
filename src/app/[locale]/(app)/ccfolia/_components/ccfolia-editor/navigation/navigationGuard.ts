import { t } from 'i18next';
import { atom } from 'jotai';
import { withAtomEffect } from 'jotai-effect';

import { BEFORE_SIGN_OUT_EVENT } from '@/shared/lib/firebase/signOut';
import { authUserAtom, authUserLoadingAtom } from '@/shared/lib/firebase/useFirebaseAuth';

import { formPortAtom } from '../character-form/editorForm';
import {
  hasUnsavedChangesAtom,
  remoteConflictAtom,
  resetEditorAsUnsavedNew,
  selectionAtom,
} from '../saved-characters/savedCharacters';
import { retainNavigationFallbackDraft, takeNavigationFallbackDraft } from './navigationFallbackDraft';

const navigationApprovedStateAtom = atom(false);

export const navigationAtom = withAtomEffect(navigationApprovedStateAtom, (get, set) => {
  const uid = get(authUserAtom)?.uid ?? null;
  const form = get(formPortAtom);
  if (!get(authUserLoadingAtom) && !window.navigation && form) {
    const draft = takeNavigationFallbackDraft(uid);
    if (draft) {
      set(selectionAtom, { characterId: draft.selectedCharacterId, revision: draft.selectedRevision });
      set(remoteConflictAtom, null);
      resetEditorAsUnsavedNew(form, draft.character);
    }
  }
  if (!get(hasUnsavedChangesAtom)) return;

  const confirmDiscard = () => window.confirm(t('ccfolia:saved.confirm-discard'));
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!get.peek(hasUnsavedChangesAtom)) return;
    event.preventDefault();
    event.returnValue = '';
  };
  const handleBeforeSignOut = (event: Event) => {
    if (!get.peek(hasUnsavedChangesAtom)) return;
    if (!confirmDiscard()) event.preventDefault();
  };
  // Navigation API 非対応時の履歴移動はキャンセルできないため、履歴の押し戻しで模倣せず、
  // エディターの破棄時に同一 UID 用の下書きを退避して復元可能にする。
  const navigation = window.navigation;
  const handleHistoryNavigation = (event: NavigateEvent) => {
    if (event.navigationType !== 'traverse' || !event.canIntercept) return;
    if (!get.peek(hasUnsavedChangesAtom)) {
      if (!event.defaultPrevented) set(navigationApprovedStateAtom, true);
      return;
    }
    if (!confirmDiscard()) {
      event.preventDefault();
      return;
    }
    set(navigationApprovedStateAtom, true);
  };
  const handleLinkNavigation = (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!target || target.hasAttribute('download') || (target.target && target.target !== '_self')) return;
    const destination = new URL(target.href, window.location.href);
    const current = window.location;
    if (
      destination.origin !== current.origin ||
      (destination.pathname === current.pathname && destination.search === current.search)
    ) {
      return;
    }
    if (!get.peek(hasUnsavedChangesAtom)) {
      if (!event.defaultPrevented) set(navigationApprovedStateAtom, true);
      return;
    }
    if (!confirmDiscard()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    set(navigationApprovedStateAtom, true);
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener(BEFORE_SIGN_OUT_EVENT, handleBeforeSignOut);
  navigation?.addEventListener('navigate', handleHistoryNavigation);
  document.addEventListener('click', handleLinkNavigation, true);
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener(BEFORE_SIGN_OUT_EVENT, handleBeforeSignOut);
    navigation?.removeEventListener('navigate', handleHistoryNavigation);
    document.removeEventListener('click', handleLinkNavigation, true);
  };
});

export const retainNavigationDraftAtom = atom(null, (get) => {
  const form = get(formPortAtom);
  if (window.navigation || get(navigationApprovedStateAtom) || !form || !get(hasUnsavedChangesAtom)) return;
  const selection = get(selectionAtom);
  retainNavigationFallbackDraft({
    uid: get(authUserAtom)?.uid ?? null,
    character: form.getValues(),
    selectedCharacterId: selection.characterId,
    selectedRevision: selection.revision,
  });
});

export const resetNavigationStateAtom = atom(null, (_get, set) => set(navigationApprovedStateAtom, false));
