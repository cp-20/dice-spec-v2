import { useLogAnalysis } from './useLogAnalysis';

export const useCharacterLogAnalysis = (characterId: string | undefined) => {
  const { result } = useLogAnalysis();

  if (!characterId) return undefined;
  if (result?.type !== 'success') return undefined;

  const characterResult = result.results.find((r) => r.id === characterId);

  return characterResult;
};
