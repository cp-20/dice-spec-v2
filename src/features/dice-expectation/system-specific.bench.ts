import { bench, run } from 'mitata';

import { calculateCthulhu7thOpposedRoll, calculateCthulhu7thRoll } from './system-specific';

for (const modifier of [0, 2, -2]) {
  bench(`クトゥルフ7版 単独判定 補正${modifier}`, () => void calculateCthulhu7thRoll(60, modifier));
  bench(`クトゥルフ7版 対抗ロール 補正${modifier}/${modifier}`, () =>
    void calculateCthulhu7thOpposedRoll(60, 50, modifier, modifier));
}

await run();
