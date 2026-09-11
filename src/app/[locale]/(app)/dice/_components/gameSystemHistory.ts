import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import * as v from 'valibot';

import { gameSystems, gameSystemsById } from '@/shared/lib/bcdice/loader';

const recentSystemsSchema = v.pipe(
  v.array(v.union([v.string(), v.object({ id: v.string(), name: v.string() })])),
  v.transform((systems) =>
    systems.map((system) => (typeof system === 'string' || !gameSystemsById.has(system.id) ? system : system.id)),
  ),
);

type RecentSystem = v.InferOutput<typeof recentSystemsSchema>[number];
const systemId = (system: RecentSystem) => (typeof system === 'string' ? system : system.id);

// 既知のシステムは ID だけを保存し、旧データにある未収録システムの名称は保持する。
export const recentSystemsAtom = atomWithStorage<RecentSystem[]>(
  'game-system-list',
  [],
  createJSONStorage(() => localStorage, {
    reviver: (key, value) => (key === '' ? v.parse(recentSystemsSchema, value) : value),
  }),
);

export const gameSystemListAtom = atom((get) => {
  const recent = get(recentSystemsAtom);
  const ids = new Set(recent.map(systemId));
  return recent
    .map((system) => {
      const id = systemId(system);
      return gameSystemsById.get(id) ?? (typeof system === 'string' ? { id, name: id } : system);
    })
    .concat(gameSystems.filter((system) => !ids.has(system.id)));
});

export const rememberSystemAtom = atom(null, (_get, set, id: string) => {
  set(recentSystemsAtom, (recent) => [id, ...recent.filter((system) => systemId(system) !== id)]);
});
