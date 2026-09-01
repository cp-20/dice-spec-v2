import { describe, expect, test } from 'bun:test';

import { Timestamp } from 'firebase/firestore';
import * as v from 'valibot';

import {
  ccfoliaEditorCharacterSchema,
  createDefaultCcfoliaEditorCharacter,
  MAX_CCFOLIA_CHARACTER_PARAMS,
  MAX_CCFOLIA_CHARACTER_PARAM_VALUE_LENGTH,
  CcfoliaCharacterTooLargeError,
  parseCcfoliaCharacterDocument,
  parseCcfoliaClipboardCharacter,
  stringifyCcfoliaClipboardCharacter,
  toCcfoliaCharacterData,
  toCcfoliaEditorCharacter,
} from './model';

describe('CCFOLIA character model', () => {
  const editor = {
    name: ' 探索者A ',
    memo: 'メモ',
    initiative: undefined,
    externalUrl: '',
    status: [{ key: 'status-1', label: 'HP', value: 10, max: undefined }],
    params: [{ key: 'param-1', label: 'STR', value: '50' }],
    color: '#123abc',
    commands: 'CC<=50 【目星】',
  };

  test('Firestore向けデータではUI用keyを除き、未入力値をnullへ正規化する', () => {
    expect(toCcfoliaCharacterData(editor)).toEqual({
      name: '探索者A',
      memo: 'メモ',
      initiative: null,
      externalUrl: '',
      status: [{ label: 'HP', value: 10, max: null }],
      params: [{ label: 'STR', value: '50' }],
      color: '#123abc',
      commands: 'CC<=50 【目星】',
    });
  });

  test('保存前のフォーム検証で空文字と空白だけの名前を拒否する', () => {
    const defaultEditor = createDefaultCcfoliaEditorCharacter();

    expect(v.safeParse(ccfoliaEditorCharacterSchema, defaultEditor).success).toBe(false);
    expect(v.safeParse(ccfoliaEditorCharacterSchema, { ...defaultEditor, name: '   ' }).success).toBe(false);
    expect(v.safeParse(ccfoliaEditorCharacterSchema, { ...defaultEditor, name: ' 探索者 ' }).success).toBe(true);
  });

  test('Firestoreデータを編集用に戻すとUI用keyが生成される', () => {
    const restored = toCcfoliaEditorCharacter(toCcfoliaCharacterData(editor));

    expect(restored.name).toBe('探索者A');
    expect(restored.initiative).toBeUndefined();
    expect(restored.status[0]?.key).toBeString();
    expect(restored.status[0]?.max).toBeUndefined();
    expect(restored.params[0]?.key).toBeString();
  });

  test('公式Clipboard API形式で出力し、UI用keyやundefinedを含めない', () => {
    const json = stringifyCcfoliaClipboardCharacter(editor);
    const clipboard = JSON.parse(json);

    expect(json).not.toContain('status-1');
    expect(json).not.toContain('param-1');
    expect(clipboard).toEqual({
      kind: 'character',
      data: {
        name: ' 探索者A ',
        memo: 'メモ',
        externalUrl: '',
        status: [{ label: 'HP', value: 10, max: 0 }],
        params: [{ label: 'STR', value: '50' }],
        color: '#123abc',
        commands: 'CC<=50 【目星】',
      },
    });

    const restored = parseCcfoliaClipboardCharacter(json);
    expect(restored.name).toBe(' 探索者A ');
    expect(restored.status[0]).toMatchObject({ label: 'HP', value: 10, max: 0 });
    expect(restored.params[0]).toMatchObject({ label: 'STR', value: '50' });
  });

  test('公式Clipboard APIのPartial Characterを読み込み、意味のある追加フィールドを保持する', () => {
    const restored = parseCcfoliaClipboardCharacter(
      JSON.stringify({
        kind: 'character',
        data: {
          name: 'Chicken',
          secret: true,
          invisible: true,
          angle: 90,
          owner: 'owner-1',
          iconUrl: null,
          x: 10,
          active: true,
        },
      }),
    );

    expect(restored.name).toBe('Chicken');
    expect(restored.memo).toBe('');
    expect(restored.status).toHaveLength(3);
    expect(restored.color).toBe('#888888');
    expect(restored.clipboardExtensions).toEqual({
      angle: 90,
      secret: true,
      invisible: true,
      owner: 'owner-1',
    });
    const restoredFromAccount = toCcfoliaEditorCharacter(toCcfoliaCharacterData(restored));
    expect(JSON.parse(stringifyCcfoliaClipboardCharacter(restoredFromAccount)).data).toMatchObject({
      angle: 90,
      secret: true,
      invisible: true,
      owner: 'owner-1',
    });
  });

  test('Firestoreの1 MiB制限に余裕を持たせた合計サイズ上限を適用する', () => {
    expect(() =>
      toCcfoliaCharacterData({
        ...editor,
        params: Array.from({ length: MAX_CCFOLIA_CHARACTER_PARAMS }, (_, index) => ({
          key: `param-${index}`,
          label: `param-${index}`,
          value: 'a'.repeat(MAX_CCFOLIA_CHARACTER_PARAM_VALUE_LENGTH),
        })),
      }),
    ).toThrow(CcfoliaCharacterTooLargeError);
  });

  test('revisionがない保存データは読み込まない', () => {
    const data = toCcfoliaCharacterData(editor);
    const timestamp = Timestamp.fromDate(new Date('2026-08-28T00:00:00.000Z'));

    expect(() =>
      parseCcfoliaCharacterDocument({
        ...data,
        id: 'character-1',
        schemaVersion: 1,
        createdAt: timestamp,
        updatedAt: timestamp,
      }),
    ).toThrow();
  });
});
