// 正規分布 N(μ, σ²) の N(x) を計算する
export const calcNormalDistribution = (x: number, mean: number, sd: number): number => {
  const coefficient = 1 / (sd * Math.sqrt(2 * Math.PI));
  const exponent = -0.5 * ((x - mean) / sd) ** 2;
  return coefficient * Math.exp(exponent);
};

// 正規分布 N(μ, σ²) の累積分布関数 CDF(x) を計算する
export const calcNormalCDF = (x: number, mean: number, sd: number): number => {
  const z = (x - mean) / sd;
  const erf = (z: number) => {
    const sign = z < 0 ? -1 : 1;
    z = Math.abs(z);
    const a1 = 0.254829592,
      a2 = -0.284496736,
      a3 = 1.421413741,
      a4 = -1.453152027,
      a5 = 1.061405429,
      p = 0.3275911;
    const t = 1 / (1 + p * z);
    const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
    return sign * y;
  };

  return 0.5 * (1 + erf(z / Math.SQRT2));
};
