import { atom, useSetAtom } from 'jotai';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

import { analysisAtomFamily } from '@/shared/lib/firebase/stores/analyses/singleAnalysis';
import { analysisRecordsAtomFamily } from '@/shared/lib/firebase/stores/analysisRecordsStore';
import { authUserAtom } from '@/shared/lib/firebase/useFirebaseAuth';

import { ALL_CHARACTER_ID } from '../../_components/constants';
import { systems } from '@/features/log-analysis/ccfolia/messageParser';

const internalAnalysisIdAtom = atom<string | undefined>(undefined);

export const analysisIdAtom = atom((get) => get(internalAnalysisIdAtom));

export const useAnalysisIdSync = () => {
  const params = useParams<{ id: string }>();
  const setAnalysisId = useSetAtom(internalAnalysisIdAtom);

  useEffect(() => {
    setAnalysisId(params?.id);
  }, [params?.id, setAnalysisId]);
};

export const currentAnalysisAtom = atom((get) => {
  const id = get(analysisIdAtom);
  const result = get(analysisAtomFamily(id));
  return result;
});

export const isOwnerAtom = atom((get) => {
  const { analysis } = get(currentAnalysisAtom);
  const authUser = get(authUserAtom);
  return analysis !== null && authUser !== null && analysis.ownerUid === authUser.uid;
});

export const canViewRecordsAtom = atom((get) => {
  const { analysis } = get(currentAnalysisAtom);
  const isOwner = get(isOwnerAtom);
  if (analysis === null) return false;
  return analysis.showRecordDetails || isOwner;
});

export const systemNameAtom = atom((get) => {
  const { analysis } = get(currentAnalysisAtom);
  return analysis?.systemId && systems[analysis?.systemId]?.name;
});

export const selectedCharacterIdAtom = atom<string>(ALL_CHARACTER_ID);

export const selectedCharacterResultAtom = atom((get) => {
  const { analysis } = get(currentAnalysisAtom);
  const selectedCharacterId = get(selectedCharacterIdAtom);

  if (analysis === null) return null;

  return analysis.characterResults.find((c) => c.id === selectedCharacterId) ?? null;
});

export const charactersAtom = atom((get) => {
  const { analysis } = get(currentAnalysisAtom);

  if (analysis === null) return [];

  return analysis.characterResults.map((c) => ({ id: c.id, name: c.name }));
});

export const currentAnalysisRecordsAtom = atom((get) => {
  const id = get(analysisIdAtom);
  const characterId = get(selectedCharacterIdAtom);
  const { records } = get(analysisRecordsAtomFamily(id));

  if (records === null) return null;

  const characterRecord = records.characterRecords.find((c) => c.characterId === characterId);
  return characterRecord?.records ?? null;
});

export const currentAnalysisRecordsStateAtom = atom((get) => {
  const id = get(analysisIdAtom);
  return get(analysisRecordsAtomFamily(id));
});
