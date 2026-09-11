// Turbopack のチャンク分割に必要な import() を patches/bcdice@4.10.0.patch で維持する。
import DynamicLoader from 'bcdice/lib/loader/dynamic_loader';

const loader = new DynamicLoader();

export const gameSystems = loader
  .listAvailableGameSystems()
  .toSorted((a, b) => (a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0));

export const gameSystemsById = new Map(gameSystems.map((system) => [system.id, system]));

// 同時選択で同じシステムを重複初期化しない。取得失敗は次の操作で再試行できるようにする。
const systems = new Map<string, ReturnType<typeof loader.dynamicLoad>>();
export const loadGameSystem = (id: string) => {
  let system = systems.get(id);
  if (!system) {
    system = loader.dynamicLoad(id).catch((error: unknown) => {
      systems.delete(id);
      throw error;
    });
    systems.set(id, system);
  }
  return system;
};
