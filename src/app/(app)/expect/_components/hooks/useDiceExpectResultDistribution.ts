import { atom, useAtom } from 'jotai';
import { resultAtom } from './useDiceExpecter';

export type ChartElement = {
  values: number[];
  chances: (number | null)[];
  chancesCI: (number | null)[];
  chancesTarget: (number | null)[];
};

type ShowState = [boolean, boolean, boolean];

const chartElementAtom = atom<ChartElement | null>((get) => {
  const result = get(resultAtom);
  if (result === null) return null;
  if (!result.success) return null;

  const values = Object.keys(result.distribution)
    .map(Number)
    .toSorted((a, b) => a - b);

  const showChance: boolean[] = [];
  const showCI: boolean[] = [];
  const showTarget: boolean[] = [];

  const pushShowState = (showState: ShowState) => {
    showChance.push(showState[0]);
    showCI.push(showState[1]);
    showTarget.push(showState[2]);
  };

  const inCI = (value: number) =>
    result.CI.min <= value && value <= result.CI.max;

  const inTarget = (value: number) => {
    if (!result.withTarget) return false;
    const { target } = result;
    if (target.sign === '>=' && value >= target.value) return true;
    if (target.sign === '<=' && value <= target.value) return true;

    return false;
  };

  let prevShowState: ShowState = [true, false, false];
  for (const value of values) {
    const isInCI = inCI(value);
    const isInTarget = inTarget(value);

    const currentShowState: ShowState = [
      !isInTarget && !isInCI,
      !isInTarget && isInCI,
      isInTarget,
    ];

    if (isEqualShowState(prevShowState, currentShowState)) {
      pushShowState(currentShowState);
    }

    // chance -> CI
    if (prevShowState[0] && currentShowState[1]) {
      showCI[showCI.length - 1] = true;
      pushShowState(currentShowState);
    }

    // chance -> target
    if (prevShowState[0] && currentShowState[2]) {
      pushShowState([true, false, true]);
    }

    // CI -> chance
    if (prevShowState[1] && currentShowState[0]) {
      pushShowState([true, true, false]);
    }

    // CI -> target
    if (prevShowState[1] && currentShowState[2]) {
      pushShowState([false, true, true]);
    }

    // target -> chance
    if (prevShowState[2] && currentShowState[0]) {
      pushShowState([true, false, true]);
    }

    // target -> CI
    if (prevShowState[2] && currentShowState[1]) {
      pushShowState([false, true, true]);
    }

    prevShowState = currentShowState;
  }

  const chances = showChance.map((value, i) =>
    value ? result.distribution[values[i]] : null,
  );
  const chancesCI = showCI.map((value, i) =>
    value ? result.distribution[values[i]] : null,
  );
  const chancesTarget = showTarget.map((value, i) =>
    value ? result.distribution[values[i]] : null,
  );

  return {
    values,
    chances,
    chancesCI,
    chancesTarget,
  };
});

const isEqualShowState = (a: ShowState, b: ShowState) =>
  a.every((value, i) => value === b[i]);

export const useChartElement = () => {
  const [chartElement] = useAtom(chartElementAtom);

  return {
    chartElement,
  };
};
