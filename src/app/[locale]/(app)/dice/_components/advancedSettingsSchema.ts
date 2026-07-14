import type { InferOutput } from 'valibot';
import * as v from 'valibot';

export const AdvancedSettingsFormSchema = v.object({
  showHelp: v.boolean(),
  playSound: v.boolean(),
  volume: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  bcdiceApiEndpoint: v.pipe(v.string(), v.url()),
});

export type AdvancedSettings = InferOutput<typeof AdvancedSettingsFormSchema>;
