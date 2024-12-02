import type { InferInput } from "valibot";
import {
  array,
  boolean,
  literal,
  number,
  object,
  optional,
  parse,
  string,
  union,
} from "valibot";

const diceRollResultSchema = union([
  object({
    ok: literal(false),
    reason: optional(string()),
  }),
  object({
    ok: literal(true),
    text: string(),
    secret: boolean(),
    success: boolean(),
    failure: boolean(),
    critical: boolean(),
    fumble: boolean(),
    rands: array(
      object({
        kind: union([literal("normal"), literal("tens_d10"), literal("d9")]),
        sides: number(),
        value: number(),
      }),
    ),
  }),
]);

export type DiceRollResult = InferInput<typeof diceRollResultSchema>;

export const getDiceRollGenerator =
  (bcdiceApiEndpoint: string) => async (command: string, system: string) => {
    try {
      const response = await fetch(
        `${bcdiceApiEndpoint}/v2/game_system/${system}/roll?command=${
          encodeURIComponent(
            command,
          )
        }`,
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const json = await response.json();
      const result = parse(diceRollResultSchema, json);

      return result;
    } catch (err) {
      return {
        ok: false,
      } as const;
    }
  };
