import { type FieldValue, Timestamp } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import * as v from 'valibot';

export const CCFOLIA_CHARACTER_SCHEMA_VERSION = 1 as const;
export const CCFOLIA_CHARACTER_SAVE_LIMIT_FREE = 3;
export const CCFOLIA_CHARACTER_PAGE_SIZE = 12;
// Firestore のドキュメントは1つあたり 1MiB の制限があるため、ドキュメント本体以外のメタデータを考慮した 800KiB 以下に保つ
export const MAX_CCFOLIA_CHARACTER_DOCUMENT_BYTES = 800_000;
export const MAX_CCFOLIA_CHARACTER_NAME_LENGTH = 100;
export const MAX_CCFOLIA_CHARACTER_MEMO_LENGTH = 50_000;
export const MAX_CCFOLIA_CHARACTER_EXTERNAL_URL_LENGTH = 2_048;
export const MAX_CCFOLIA_CHARACTER_STATUSES = 100;
export const MAX_CCFOLIA_CHARACTER_PARAMS = 200;
export const MAX_CCFOLIA_CHARACTER_COMMANDS_LENGTH = 100_000;
export const MAX_CCFOLIA_CHARACTER_LABEL_LENGTH = 100;
export const MAX_CCFOLIA_CHARACTER_PARAM_VALUE_LENGTH = 10_000;

const colorSchema = v.pipe(v.string(), v.regex(/^#[0-9a-f]{6}$/i));
const nameSchema = v.pipe(
  v.string(),
  v.check((value) => value.trim().length > 0),
  v.maxLength(MAX_CCFOLIA_CHARACTER_NAME_LENGTH),
);
const memoSchema = v.pipe(v.string(), v.maxLength(MAX_CCFOLIA_CHARACTER_MEMO_LENGTH));
const externalUrlSchema = v.pipe(v.string(), v.maxLength(MAX_CCFOLIA_CHARACTER_EXTERNAL_URL_LENGTH));
const labelSchema = v.pipe(v.string(), v.maxLength(MAX_CCFOLIA_CHARACTER_LABEL_LENGTH));
const paramValueSchema = v.pipe(v.string(), v.maxLength(MAX_CCFOLIA_CHARACTER_PARAM_VALUE_LENGTH));
const commandsSchema = v.pipe(v.string(), v.maxLength(MAX_CCFOLIA_CHARACTER_COMMANDS_LENGTH));
const clipboardOwnerSchema = v.pipe(v.string(), v.maxLength(MAX_CCFOLIA_CHARACTER_EXTERNAL_URL_LENGTH));
const finiteNumberSchema = v.pipe(v.number(), v.finite());

const clipboardExtensionsSchema = v.object({
  angle: v.optional(finiteNumberSchema),
  width: v.optional(finiteNumberSchema),
  height: v.optional(finiteNumberSchema),
  secret: v.optional(v.boolean()),
  invisible: v.optional(v.boolean()),
  hideStatus: v.optional(v.boolean()),
  owner: v.optional(v.nullable(clipboardOwnerSchema)),
});

type CcfoliaClipboardExtensions = v.InferOutput<typeof clipboardExtensionsSchema>;

const ccfoliaStatusSchema = v.object({
  label: labelSchema,
  value: v.nullable(finiteNumberSchema),
  max: v.nullable(finiteNumberSchema),
});

const ccfoliaParameterSchema = v.object({
  label: labelSchema,
  value: paramValueSchema,
});

export const ccfoliaCharacterDataSchema = v.object({
  name: nameSchema,
  memo: memoSchema,
  initiative: v.nullable(finiteNumberSchema),
  externalUrl: externalUrlSchema,
  status: v.pipe(v.array(ccfoliaStatusSchema), v.maxLength(MAX_CCFOLIA_CHARACTER_STATUSES)),
  params: v.pipe(v.array(ccfoliaParameterSchema), v.maxLength(MAX_CCFOLIA_CHARACTER_PARAMS)),
  color: colorSchema,
  commands: commandsSchema,
  clipboardExtensions: v.optional(clipboardExtensionsSchema),
});

export type CcfoliaCharacterData = v.InferOutput<typeof ccfoliaCharacterDataSchema>;

export class CcfoliaCharacterTooLargeError extends Error {
  constructor() {
    super('The CCFOLIA character exceeds the account storage size limit');
    this.name = 'CcfoliaCharacterTooLargeError';
  }
}

export const getCcfoliaCharacterDataByteLength = (data: CcfoliaCharacterData): number =>
  new TextEncoder().encode(JSON.stringify(data)).byteLength;

export const ccfoliaCharacterDocumentSchema = v.object({
  id: v.string(),
  schemaVersion: v.literal(CCFOLIA_CHARACTER_SCHEMA_VERSION),
  revision: v.pipe(v.number(), v.integer(), v.minValue(1)),
  ...ccfoliaCharacterDataSchema.entries,
  createdAt: v.instance(Timestamp),
  updatedAt: v.instance(Timestamp),
});

export type CcfoliaCharacterDocument = v.InferOutput<typeof ccfoliaCharacterDocumentSchema>;

export type NewCcfoliaCharacterDocument = Omit<CcfoliaCharacterDocument, 'createdAt' | 'updatedAt'> & {
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

export const parseCcfoliaCharacterDocument = (value: unknown): CcfoliaCharacterDocument =>
  v.parse(ccfoliaCharacterDocumentSchema, value);

const editorStatusSchema = v.object({
  key: v.string(),
  label: labelSchema,
  value: v.optional(finiteNumberSchema),
  max: v.optional(finiteNumberSchema),
});

const editorParameterSchema = v.object({
  key: v.string(),
  label: labelSchema,
  value: paramValueSchema,
});

export const ccfoliaEditorCharacterSchema = v.object({
  name: nameSchema,
  memo: memoSchema,
  initiative: v.optional(finiteNumberSchema),
  externalUrl: v.optional(externalUrlSchema),
  status: v.pipe(v.array(editorStatusSchema), v.maxLength(MAX_CCFOLIA_CHARACTER_STATUSES)),
  params: v.pipe(v.array(editorParameterSchema), v.maxLength(MAX_CCFOLIA_CHARACTER_PARAMS)),
  color: colorSchema,
  commands: commandsSchema,
  clipboardExtensions: v.optional(clipboardExtensionsSchema),
});

export type CcfoliaEditorCharacter = v.InferOutput<typeof ccfoliaEditorCharacterSchema>;

const clipboardStatusSchema = v.pipe(
  v.array(
    v.object({
      label: labelSchema,
      value: finiteNumberSchema,
      max: finiteNumberSchema,
    }),
  ),
  v.maxLength(MAX_CCFOLIA_CHARACTER_STATUSES),
);

const clipboardParamsSchema = v.pipe(
  v.array(
    v.object({
      label: labelSchema,
      value: paramValueSchema,
    }),
  ),
  v.maxLength(MAX_CCFOLIA_CHARACTER_PARAMS),
);

const clipboardCharacterDataSchema = v.object({
  name: v.optional(v.pipe(v.string(), v.maxLength(MAX_CCFOLIA_CHARACTER_NAME_LENGTH))),
  memo: v.optional(memoSchema),
  initiative: v.optional(finiteNumberSchema),
  externalUrl: v.optional(externalUrlSchema),
  status: v.optional(clipboardStatusSchema),
  params: v.optional(clipboardParamsSchema),
  ...clipboardExtensionsSchema.entries,
  color: v.optional(colorSchema),
  commands: v.optional(commandsSchema),
});

const clipboardCharacterSchema = v.object({
  kind: v.literal('character'),
  data: clipboardCharacterDataSchema,
});

export const createDefaultCcfoliaEditorCharacter = (): CcfoliaEditorCharacter => ({
  name: '',
  memo: '',
  externalUrl: '',
  status: [
    { key: nanoid(), label: 'HP', value: 0, max: 0 },
    { key: nanoid(), label: 'MP', value: 0, max: 0 },
    { key: nanoid(), label: 'SAN', value: 0, max: 0 },
  ],
  params: [],
  color: '#888888',
  commands: '',
});

export const toCcfoliaCharacterData = (editor: CcfoliaEditorCharacter): CcfoliaCharacterData => {
  const data = v.parse(ccfoliaCharacterDataSchema, {
    name: editor.name.trim(),
    memo: editor.memo,
    initiative: editor.initiative ?? null,
    externalUrl: editor.externalUrl ?? '',
    status: editor.status.map(({ label, value, max }) => ({
      label,
      value: value ?? null,
      max: max ?? null,
    })),
    params: editor.params.map(({ label, value }) => ({ label, value })),
    color: editor.color,
    commands: editor.commands,
    ...(editor.clipboardExtensions ? { clipboardExtensions: editor.clipboardExtensions } : {}),
  });

  if (getCcfoliaCharacterDataByteLength(data) > MAX_CCFOLIA_CHARACTER_DOCUMENT_BYTES) {
    throw new CcfoliaCharacterTooLargeError();
  }

  return data;
};

export const toCcfoliaEditorCharacter = (character: CcfoliaCharacterData): CcfoliaEditorCharacter => ({
  name: character.name,
  memo: character.memo,
  initiative: character.initiative ?? undefined,
  externalUrl: character.externalUrl,
  status: character.status.map(({ label, value, max }) => ({
    key: nanoid(),
    label,
    value: value ?? undefined,
    max: max ?? undefined,
  })),
  params: character.params.map(({ label, value }) => ({ key: nanoid(), label, value })),
  color: character.color,
  commands: character.commands,
  ...(character.clipboardExtensions ? { clipboardExtensions: character.clipboardExtensions } : {}),
});

/**
 * 与えられたテキストをパースして {@link CcfoliaEditorCharacter} を返す
 * パース不可能な場合は例外を投げる
 */
export const parseCcfoliaClipboardCharacter = (text: string): CcfoliaEditorCharacter => {
  const parsedJson: unknown = JSON.parse(text);
  const data = v.parse(clipboardCharacterSchema, parsedJson);
  const character = data.data;
  const clipboardExtensions: CcfoliaClipboardExtensions = {
    ...(character.angle === undefined ? {} : { angle: character.angle }),
    ...(character.width === undefined ? {} : { width: character.width }),
    ...(character.height === undefined ? {} : { height: character.height }),
    ...(character.secret === undefined ? {} : { secret: character.secret }),
    ...(character.invisible === undefined ? {} : { invisible: character.invisible }),
    ...(character.hideStatus === undefined ? {} : { hideStatus: character.hideStatus }),
    ...(character.owner === undefined ? {} : { owner: character.owner }),
  };

  const defaults = createDefaultCcfoliaEditorCharacter();
  const status = character.status?.map((status) => ({ key: nanoid(), ...status })) ?? defaults.status;
  const params = character.params?.map((param) => ({ key: nanoid(), ...param })) ?? defaults.params;

  return {
    name: character.name ?? defaults.name,
    memo: character.memo ?? defaults.memo,
    initiative: character.initiative ?? defaults.initiative,
    externalUrl: character.externalUrl ?? defaults.externalUrl,
    status,
    params,
    color: character.color ?? defaults.color,
    commands: character.commands ?? defaults.commands,
    clipboardExtensions,
  };
};

export const stringifyCcfoliaClipboardCharacter = (editor: CcfoliaEditorCharacter): string => {
  const data: v.InferInput<typeof clipboardCharacterSchema> = {
    kind: 'character',
    data: {
      ...editor.clipboardExtensions,
      name: editor.name,
      memo: editor.memo,
      ...(editor.initiative === undefined ? {} : { initiative: editor.initiative }),
      externalUrl: editor.externalUrl ?? '',
      status: editor.status.map(({ label, value, max }) => ({ label, value: value ?? 0, max: max ?? 0 })),
      params: editor.params.map(({ label, value }) => ({ label, value })),
      color: editor.color,
      commands: editor.commands,
    },
  };

  return JSON.stringify(data);
};
