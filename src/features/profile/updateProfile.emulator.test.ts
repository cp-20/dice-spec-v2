import { doc, getDocFromServer, Timestamp } from 'firebase/firestore';
import * as v from 'valibot';

import { userDocumentSchema } from '@/features/user/firebase/schema';
import { getFirebaseFirestore } from '@/shared/lib/firebase/client';
import { setupFirebaseIntegration } from '@/test/firebase';

import { updateProfile } from './useProfileMutations';

const firebase = setupFirebaseIntegration();
const createdAt = Timestamp.fromMillis(1_000);
const read = async (path: string) => (await getDocFromServer(doc(getFirebaseFirestore(), path))).data();

test('プラン変更前に保存した解析があっても、表示名の変更を users と解析の owner へ反映する', async () => {
  const uid = firebase.uid();
  const user = {
    id: uid,
    name: '変更前',
    plan: 'pro',
    createdAt,
    updatedAt: createdAt,
    stripeCustomerId: 'cus_test',
    stripeSubscriptionId: 'sub_test',
    analysisCount: 1,
    analysisCountSyncAnalysisId: null,
  };
  await firebase.seed(`users/${uid}`, user);
  // 課金サーバーは users.plan だけを書き換えるため、解析の owner には保存時のプランが残る。
  await firebase.seed('analyses/analysis-1', {
    id: 'analysis-1',
    title: 'Session 1',
    ownerUid: uid,
    systemId: 'CoC7th',
    visibilityLevel: 'private',
    showRecordDetails: false,
    characterResults: [{ id: 'all', summary: { deviationScore: 0 } }],
    sessionDate: createdAt,
    createdAt,
    updatedAt: createdAt,
    primaryDeviationScore: 0,
    owner: { id: uid, name: '変更前', plan: 'free', createdAt, updatedAt: createdAt },
  });

  await updateProfile(getFirebaseFirestore(), v.parse(userDocumentSchema, user), ['analysis-1'], { name: '変更後' });

  expect(await read(`users/${uid}`)).toMatchObject({ name: '変更後', plan: 'pro' });
  expect((await read('analyses/analysis-1'))?.owner).toMatchObject({ id: uid, name: '変更後', plan: 'pro', createdAt });
});
