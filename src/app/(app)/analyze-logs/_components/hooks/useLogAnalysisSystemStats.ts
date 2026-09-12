import { useLogAnalysis } from './useLogAnalysis';

export const useLogAnalysisSystemStats = () => {
  const { systemStats } = useLogAnalysis();
  return systemStats;
};
