import { expect, test } from 'bun:test';

import { createDefaultCcfoliaEditorCharacter } from '@/features/ccfolia/model';

import { retainNavigationFallbackDraft, takeNavigationFallbackDraft } from './navigationFallbackDraft';

test('同じアカウントの履歴復元では既存キャラクターの保存先を維持する', () => {
  const character = { ...createDefaultCcfoliaEditorCharacter(), name: '編集中' };
  retainNavigationFallbackDraft({
    uid: 'user-a',
    character,
    selectedCharacterId: 'character-1',
    selectedRevision: 3,
  });

  expect(takeNavigationFallbackDraft('user-a')).toEqual({
    uid: 'user-a',
    character,
    selectedCharacterId: 'character-1',
    selectedRevision: 3,
  });
});

test('別アカウントの履歴復元データは破棄する', () => {
  retainNavigationFallbackDraft({
    uid: 'user-a',
    character: createDefaultCcfoliaEditorCharacter(),
    selectedCharacterId: 'character-1',
    selectedRevision: 3,
  });

  expect(takeNavigationFallbackDraft('user-b')).toBeNull();
  expect(takeNavigationFallbackDraft('user-a')).toBeNull();
});
