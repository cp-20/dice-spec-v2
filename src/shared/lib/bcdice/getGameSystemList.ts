import type { InferInput } from 'valibot';
import * as v from 'valibot';

export const gameSystemSchema = v.object({
  id: v.string(),
  name: v.string(),
  sort_key: v.string(),
});

export type GameSystem = InferInput<typeof gameSystemSchema>;
