import type { InferInput } from 'valibot';
import * as v from 'valibot';

export const gameSystemSchema = v.object({
  id: v.string(),
  name: v.string(),
  sort_key: v.string(),
});

export type GameSystem = InferInput<typeof gameSystemSchema>;

const getGameSystemListSchema = v.object({
  game_system: v.array(gameSystemSchema),
});

export type GameSystemList = InferInput<typeof getGameSystemListSchema>;

export const getGameSystemListGenerator = (bcdiceApiEndpoint: string) => async () => {
  try {
    const res = await fetch(`${bcdiceApiEndpoint}/v2/game_system`);
    if (!res.ok) throw new Error(res.statusText);

    const maybeGameSystems = await res.json();

    const gameSystems = v.parse(getGameSystemListSchema, maybeGameSystems);

    return gameSystems.game_system;
  } catch (err) {
    console.error(err);
    return [];
  }
};
