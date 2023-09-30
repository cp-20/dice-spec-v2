import { array, object, parse, string } from 'valibot';
import { bcdiceApiEndpoint } from '@/shared/lib/const';

const getGameSystemListSchema = object({
  game_system: array(
    object({
      id: string(),
      name: string(),
      sort_key: string(),
    }),
  ),
});

export const fetchGameSystemList = async () => {
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
