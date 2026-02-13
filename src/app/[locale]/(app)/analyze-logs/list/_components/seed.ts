import { Timestamp } from 'firebase/firestore';
import { useEffect } from 'react';
import { useDeleteAnalysis, useSaveAnalysis } from '@/shared/lib/firebase/stores/analyses/mutations';
import { useMyAnalyses } from '@/shared/lib/firebase/stores/analyses/userAnalyses';
import { useMeStore } from '@/shared/lib/firebase/stores/userStore';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';
import { analyzeCcfoliaLog } from '../../_components/hooks/ccfoliaLogAnalysis';
import { detectSystem } from '../../_components/hooks/ccfoliaLogAnalysis/detector';

// FIXME: デバッグ用にシードデータを挿入している
export const useSeedAnalyses = () => {
  const { authUser } = useFirebaseAuth();
  const { me } = useMeStore();
  const { saveAnalysis } = useSaveAnalysis();
  const { analyses } = useMyAnalyses();
  const { deleteAnalysis } = useDeleteAnalysis();

  useEffect(() => {
    const addSeedData = async () => {
      if (!authUser) {
        console.warn('No auth user, skipping seeding analyses');
        return;
      }

      const data = (await fetch('/analyze-logs/seed-logs').then((r) => r.json())) as {
        name: string;
        content: string;
      }[];

      for (const log of data) {
        const scenarioName = log.name.match(/^(.*?)(\[main\])?\.html$/)?.[1] ?? log.name;

        console.log(`Seeding analysis for scenario: ${scenarioName}`);

        const system = detectSystem(log.content);
        const results = analyzeCcfoliaLog(system, log.content);
        const sessionDate = new Date(
          new Date(`${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`).getTime() -
            Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000,
        );
        console.log(sessionDate);

        await saveAnalysis({
          title: scenarioName,
          systemId: system,
          visibilityLevel: 'public',
          showRecordDetails: true,
          ownerUid: authUser.uid,
          owner: {
            name: me.name,
            avatarUrl: me.avatarUrl,
            plan: me.plan,
            createdAt: me.createdAt,
            updatedAt: me.updatedAt,
          },
          characterResults: results,
          sessionDate: Timestamp.fromDate(sessionDate),
        });
      }
    };

    const removeAllData = async () => {
      if (!authUser) {
        console.warn('No auth user, skipping removing analyses');
        return;
      }

      for (const analysis of analyses) {
        await deleteAnalysis(analysis.id);
      }
    };

    // @ts-expect-error
    window.addSeedData = addSeedData;
    // @ts-expect-error
    window.removeAllData = removeAllData;
  }, [authUser, me, saveAnalysis, analyses, deleteAnalysis]);
};
