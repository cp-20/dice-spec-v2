import type { Input } from 'valibot';
import { object, parse, string } from 'valibot';

const gameSystemInfoSchema = object({
  id: string(),
  name: string(),
  sort_key: string(),
  command_pattern: string(),
  help_message: string(),
});

export type GameSystemInfo = Input<typeof gameSystemInfoSchema>;

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
      throw new Error('Network response was not ok');
    }

    const json = await response.json();
    const systemInfo = parse(gameSystemInfoSchema, json);

    return systemInfo;
  };
