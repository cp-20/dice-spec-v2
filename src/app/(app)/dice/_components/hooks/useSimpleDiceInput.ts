import { atom, useAtom } from 'jotai';

import { SIMPLE_DICE_COUNT_RANGE, SIMPLE_DICE_FACES_RANGE } from './simpleDiceTypes';
import { useSimpleDiceRoll } from './useSimpleDiceRoll';

export type SimpleDice = { count: number; faces: number };

const simpleDiceInputAtom = atom<SimpleDice>({ count: 1, faces: 6 });

const clamp = (value: number, { min, max }: { min: number; max: number }) => Math.min(Math.max(value, min), max);

export const useSimpleDiceInput = () => {
  const { simpleDiceRoll } = useSimpleDiceRoll();
  const [input, setInput] = useAtom(simpleDiceInputAtom);

  const roll = (dice: SimpleDice) => {
    setInput(dice);
    simpleDiceRoll({ [dice.faces]: dice.count });
  };

  return {
    input,
    changeCount: (diff: number) =>
      setInput((prev) => ({ ...prev, count: clamp(prev.count + diff, SIMPLE_DICE_COUNT_RANGE) })),
    changeFaces: (faces: number) => setInput((prev) => ({ ...prev, faces: clamp(faces, SIMPLE_DICE_FACES_RANGE) })),
    rollInput: () => roll(input),
    // プリセットを振ると入力にも反映し、個数や面数を変えれば別のダイスを振れることを示す。
    roll,
  };
};
