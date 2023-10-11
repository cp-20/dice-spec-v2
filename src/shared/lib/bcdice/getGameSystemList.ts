import type { Input } from 'valibot';
import { array, object, parse, string } from 'valibot';

export const gameSystemSchema = object({
  id: string(),
  name: string(),
  sort_key: string(),
});

export type GameSystem = Input<typeof gameSystemSchema>;

const getGameSystemListSchema = object({
  game_system: array(gameSystemSchema),
});

export type GameSystemList = Input<typeof getGameSystemListSchema>;

export const getGameSystemListGenerator =
  (bcdiceApiEndpoint: string) => async () => {
    try {
      const res = await fetch(`${bcdiceApiEndpoint}/v2/game_system`);
      if (!res.ok) throw new Error(res.statusText);

      const maybeGameSystems = await res.json();

      const gameSystems = parse(getGameSystemListSchema, maybeGameSystems);

      return gameSystems.game_system;
    } catch (err) {
      console.error(err);
      return [];
    }
  };
