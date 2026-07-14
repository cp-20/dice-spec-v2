import type { InferInput } from 'valibot';
import * as v from 'valibot';

export const InputFormSchema = v.object({
  name: v.string(),
  memo: v.string(),
  initiative: v.optional(v.number()),
  externalUrl: v.optional(v.string()),
  status: v.array(
    v.object({
      key: v.string(),
      label: v.string(),
      value: v.optional(v.number()),
      max: v.optional(v.number()),
    }),
  ),
  params: v.array(
    v.object({
      key: v.string(),
      label: v.string(),
      value: v.string(),
    }),
  ),
  color: v.pipe(v.string(), v.regex(/^#[0-9a-f]{6}$/i)),
  commands: v.string(),
});

export type InputFormSchemaType = InferInput<typeof InputFormSchema>;
