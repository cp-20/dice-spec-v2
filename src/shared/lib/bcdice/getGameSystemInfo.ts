import { loadGameSystem } from './loader';

export const getGameSystemInfo = async (id: string) => {
  const system = await loadGameSystem(id);
  return {
    id: system.ID,
    name: system.NAME,
    sort_key: system.SORT_KEY,
    command_pattern: system.COMMAND_PATTERN,
    help_message: system.HELP_MESSAGE,
  };
};

export type GameSystemInfo = Awaited<ReturnType<typeof getGameSystemInfo>>;
