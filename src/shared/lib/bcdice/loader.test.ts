import { describe, expect, test } from 'bun:test';

import { gameSystems, gameSystemsById, loadGameSystem } from './loader';

describe('BCDice の読み込みと評価', () => {
  test('同梱カタログと代表システムのヘルプ・コマンドが一致する', async () => {
    expect(gameSystems).toHaveLength(336);
    for (const [id, command] of [
      ['DiceBot', '1D6'],
      ['Cthulhu7th', 'CC<=100'],
      ['SwordWorld2.5', 'K20+5'],
    ]) {
      const engine = await loadGameSystem(id);
      expect(engine.ID).toBe(id);
      expect(engine.NAME).toBe(gameSystemsById.get(id)?.name);
      expect(engine.HELP_MESSAGE.length).toBeGreaterThan(0);
      expect(engine.COMMAND_PATTERN.test(command)).toBe(true);
      expect(engine.eval(command)?.text.length).toBeGreaterThan(0);
    }
  });

  test('無効コマンド・秘匿・成功・失敗を同期的に評価する', async () => {
    const engine = await loadGameSystem('DiceBot');
    expect(engine.eval('invalid')).toBeNull();
    expect(engine.eval('S1D6')).toMatchObject({ secret: true });
    expect(engine.eval('1D6>=1')).toMatchObject({ success: true });
    expect(engine.eval('1D6>=7')).toMatchObject({ failure: true });
  });

  test('同時読み込みと読込済みエンジンを共有し、失敗はキャッシュに残さない', async () => {
    const first = loadGameSystem('Cthulhu7th');
    expect(loadGameSystem('Cthulhu7th')).toBe(first);
    expect(await loadGameSystem('Cthulhu7th')).toBe(await first);

    const failed = loadGameSystem('MissingSystem');
    await expect(failed).rejects.toThrow();
    const retry = loadGameSystem('MissingSystem');
    expect(retry).not.toBe(failed);
    await expect(retry).rejects.toThrow();
  });
});
