export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const addProbability = (distribution: Record<number, number>, value: number, probability: number) => {
  distribution[value] = (distribution[value] ?? 0) + probability;
};

export const toRows = (distribution: Record<number, number>) =>
  Object.keys(distribution)
    .map(Number)
    .sort((a, b) => a - b)
    .map((value) => ({ label: String(value), probability: distribution[value] }));

export const getMean = (distribution: Record<number, number>) =>
  Object.entries(distribution).reduce((acc, [value, probability]) => acc + Number(value) * probability, 0);

export const combination = (n: number, r: number) => {
  if (r < 0 || n < r) return 0;
  const smaller = Math.min(r, n - r);
  let result = 1;

  for (let i = 1; i <= smaller; i++) {
    result = (result * (n - smaller + i)) / i;
  }

  return result;
};
