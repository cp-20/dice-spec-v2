import { useLogAnalysis } from './useLogAnalysis';

export const useCharacterLogAnalysis = (characterId: string | undefined) => {
  const { result } = useLogAnalysis();

  if (!characterId) return undefined;

  const characterResult = result.find((r) => r.id === characterId);

  return characterResult;
};
