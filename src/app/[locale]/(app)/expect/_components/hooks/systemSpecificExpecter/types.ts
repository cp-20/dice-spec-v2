export type ProbabilityRow = {
  label: string;
  probability: number;
};

export type DistributionResult = {
  rows: ProbabilityRow[];
  mean?: number;
  chance?: number;
  range?: {
    min: number;
    max: number;
  };
};
