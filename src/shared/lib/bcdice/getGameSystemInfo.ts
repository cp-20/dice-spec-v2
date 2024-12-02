import type { InferInput } from "valibot";
import * as v from "valibot";

const gameSystemInfoSchema = v.object({
  id: v.string(),
  name: v.string(),
  sort_key: v.string(),
  command_pattern: v.string(),
  help_message: v.string(),
});

export type GameSystemInfo = InferInput<typeof gameSystemInfoSchema>;

const gameSystemInfoCache = new Map<string, GameSystemInfo>();

export const getGameSystemInfoGenerator =
  (bcdiceApiEndpoint: string) => async (system: string) => {
    if (gameSystemInfoCache.has(system)) {
      return gameSystemInfoCache.get(system)!;
    }

    const response = await fetch(
      `${bcdiceApiEndpoint}/v2/game_system/${system}`,
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const json = await response.json();
    const systemInfo = v.parse(gameSystemInfoSchema, json);

    return systemInfo;
  };
