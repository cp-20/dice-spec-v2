export const groupBy = <K extends PropertyKey, V>(
  array: readonly V[],
  getKey: (cur: V, idx: number, src: readonly V[]) => K,
) =>
  array.reduce(
    (obj, cur, idx, src) => {
      const key = getKey(cur, idx, src);
      (obj[key] || (obj[key] = []))!.push(cur);
      return obj;
    },
    {} as Partial<Record<K, V[]>>,
  );
