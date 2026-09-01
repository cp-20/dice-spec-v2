import { beforeEach, describe, expect, test } from 'bun:test';

import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { list as storageList, ref as storageRef } from 'firebase/storage';

import {
  analysisDoc,
  ccfoliaCharacterDoc,
  deleteAnalysisWithCountSync,
  deleteCcfoliaCharacterWithCountSync,
  ownerSnapshot,
  saveAnalysisWithCountSync,
  saveCcfoliaCharacterWithCountSync,
  seed,
  seedAnalysis,
  seedCharacter,
  seedUser,
  userDoc,
} from './test/firestore-fixtures';
import { setupRulesTestEnvironment, type TestFirestore } from './test/rules-test-environment';

describe('Firebase セキュリティルール', () => {
  const testEnv = setupRulesTestEnvironment();
  let ownerDb: TestFirestore;

  beforeEach(() => {
    ownerDb = testEnv.firestore('user_1');
  });

  describe('users', () => {
    test('本人は自分のユーザードキュメントを作成・取得できる', async () => {
      await assertSucceeds(setDoc(doc(ownerDb, 'users/user_1'), userDoc()));
      await assertSucceeds(getDoc(doc(ownerDb, 'users/user_1')));
    });

    test('アバターなしでも自分のユーザードキュメントを作成できる', async () => {
      const { avatarUrl: _avatarUrl, ...documentWithoutAvatar } = userDoc();

      await assertSucceeds(setDoc(doc(ownerDb, 'users/user_1'), documentWithoutAvatar));
    });

    test('ドキュメント ID と data.id が一致しない作成は拒否される', async () => {
      await assertFails(setDoc(doc(ownerDb, 'users/user_1'), userDoc({ id: 'other_user' })));
    });

    test('他人のユーザードキュメントは取得・更新できない', async () => {
      await testEnv.seedFirestore(seedUser());

      const otherDb = testEnv.firestore('user_2');

      await assertFails(getDoc(doc(otherDb, 'users/user_1')));
      await assertFails(
        updateDoc(doc(otherDb, 'users/user_1'), {
          name: 'Mallory',
          updatedAt: Timestamp.fromDate(new Date('2026-03-18T01:00:00.000Z')),
        }),
      );
    });

    test('悪意のあるクライアントが任意の stripeCustomerId でユーザードキュメントを作成できない', async () => {
      const maliciousDb = testEnv.firestore('user_malicious');

      await assertFails(
        setDoc(doc(maliciousDb, 'users/user_malicious'), userDoc({ stripeCustomerId: 'cus_stolen_id_123' })),
      );
    });

    test('本人でも plan と Stripe の ID は直接変更できない', async () => {
      await testEnv.seedFirestore(seedUser());

      await assertFails(
        updateDoc(doc(ownerDb, 'users/user_1'), {
          plan: 'pro',
          updatedAt: Timestamp.fromDate(new Date('2026-03-18T01:00:00.000Z')),
        }),
      );

      await assertFails(
        updateDoc(doc(ownerDb, 'users/user_1'), {
          stripeCustomerId: 'cus_hacked',
          updatedAt: Timestamp.fromDate(new Date('2026-03-18T01:00:00.000Z')),
        }),
      );

      await assertFails(
        updateDoc(doc(ownerDb, 'users/user_1'), {
          stripeSubscriptionId: 'sub_hacked',
          updatedAt: Timestamp.fromDate(new Date('2026-03-18T01:00:00.000Z')),
        }),
      );
    });
  });

  describe('ccfoliaCharacters', () => {
    test('本人はキャラクターを作成・一覧取得・更新・削除できる', async () => {
      await testEnv.seedFirestore(seedUser());

      const characterRef = doc(ownerDb, 'users/user_1/ccfoliaCharacters/c1');

      await assertSucceeds(
        saveCcfoliaCharacterWithCountSync(ownerDb, 'user_1', 'c1', {
          clipboardExtensions: { angle: 90, secret: true, owner: null },
        }),
      );
      await assertSucceeds(getDoc(characterRef));
      await assertSucceeds(getDocs(query(collection(ownerDb, 'users/user_1/ccfoliaCharacters'), limit(50))));
      await assertSucceeds(
        updateDoc(characterRef, {
          name: '探索者A（更新）',
          initiative: null,
          revision: 2,
          updatedAt: serverTimestamp(),
        }),
      );
      await assertSucceeds(deleteCcfoliaCharacterWithCountSync(ownerDb, 'user_1', 'c1'));
    });

    test('保存件数がない旧ユーザーも初回保存時にカウンターを追加できる', async () => {
      const {
        ccfoliaCharacterCount: _ccfoliaCharacterCount,
        ccfoliaCharacterCountSyncCharacterId: _ccfoliaCharacterCountSyncCharacterId,
        ...legacyUser
      } = userDoc();
      await testEnv.seedFirestore(seed('users/user_1', legacyUser));

      await assertSucceeds(saveCcfoliaCharacterWithCountSync(ownerDb, 'user_1', 'c1'));

      const savedUser = await getDoc(doc(ownerDb, 'users/user_1'));
      expect(savedUser.data()?.ccfoliaCharacterCount).toBe(1);
    });

    test('未ログインユーザーと他人は読み書きできない', async () => {
      await testEnv.seedFirestore(seedUser('user_1', { ccfoliaCharacterCount: 1 }), seedCharacter('c1'));

      const anonymousDb = testEnv.anonymousFirestore();
      const otherDb = testEnv.firestore('user_2');

      await assertFails(getDoc(doc(anonymousDb, 'users/user_1/ccfoliaCharacters/c1')));
      await assertFails(getDocs(query(collection(otherDb, 'users/user_1/ccfoliaCharacters'), limit(50))));
      await assertFails(setDoc(doc(otherDb, 'users/user_1/ccfoliaCharacters/c2'), ccfoliaCharacterDoc('c2')));
    });

    test('不正な形式と createdAt の変更は拒否される', async () => {
      await testEnv.seedFirestore(seedUser());

      const characterRef = doc(ownerDb, 'users/user_1/ccfoliaCharacters/c1');

      await assertFails(saveCcfoliaCharacterWithCountSync(ownerDb, 'user_1', 'c1', { id: 'different-id' }));
      await assertFails(saveCcfoliaCharacterWithCountSync(ownerDb, 'user_1', 'c1', { unexpected: true }));
      await assertFails(
        saveCcfoliaCharacterWithCountSync(ownerDb, 'user_1', 'c1', {
          clipboardExtensions: { secret: 'true', unexpected: true },
        }),
      );
      await assertSucceeds(saveCcfoliaCharacterWithCountSync(ownerDb, 'user_1', 'c1'));
      await assertFails(
        updateDoc(characterRef, {
          createdAt: Timestamp.fromDate(new Date('2026-03-19T00:00:00.000Z')),
          revision: 2,
          updatedAt: serverTimestamp(),
        }),
      );
    });

    test('非有限数は保存されない', async () => {
      await testEnv.seedFirestore(seedUser());

      const invalidOverrides = [
        { initiative: Number.POSITIVE_INFINITY },
        { initiative: Number.NaN },
        { clipboardExtensions: { angle: Number.NEGATIVE_INFINITY } },
        { clipboardExtensions: { width: Number.NaN } },
        { clipboardExtensions: { height: Number.POSITIVE_INFINITY } },
      ];

      for (const overrides of invalidOverrides) {
        await assertFails(saveCcfoliaCharacterWithCountSync(ownerDb, 'user_1', 'invalid-number', overrides));
      }
      await assertSucceeds(
        saveCcfoliaCharacterWithCountSync(ownerDb, 'user_1', 'finite-number', {
          initiative: Number.MAX_VALUE,
          clipboardExtensions: { angle: -90, width: 2, height: 3 },
        }),
      );
    });

    test('一覧取得には50件以下の limit が必要', async () => {
      await testEnv.seedFirestore(seedUser());

      const characters = collection(ownerDb, 'users/user_1/ccfoliaCharacters');

      await assertFails(getDocs(characters));
      await assertFails(getDocs(query(characters, limit(51))));
      await assertSucceeds(getDocs(query(characters, limit(50))));
    });

    test('親ユーザーとカウンタ同期がなければ作成・削除できない', async () => {
      await assertFails(saveCcfoliaCharacterWithCountSync(ownerDb, 'user_1', 'c1'));

      await testEnv.seedFirestore(seedUser());

      const characterRef = doc(ownerDb, 'users/user_1/ccfoliaCharacters/c1');
      await assertFails(
        setDoc(characterRef, {
          ...ccfoliaCharacterDoc('c1'),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
      );
      await assertSucceeds(saveCcfoliaCharacterWithCountSync(ownerDb, 'user_1', 'c1'));
      await assertFails(deleteDoc(characterRef));
    });

    test('読み込めない保存データもカウンタ同期で削除できる', async () => {
      await testEnv.seedFirestore(
        seedUser('user_1', { ccfoliaCharacterCount: 1 }),
        seed('users/user_1/ccfoliaCharacters/broken', {
          schemaVersion: 999,
          unsupported: true,
        }),
      );

      await assertSucceeds(deleteCcfoliaCharacterWithCountSync(ownerDb, 'user_1', 'broken'));
    });

    test('freeプランは3件を超える作成を拒否する', async () => {
      await testEnv.seedFirestore(seedUser('user_1', { ccfoliaCharacterCount: 3 }));

      await assertFails(saveCcfoliaCharacterWithCountSync(ownerDb, 'user_1', 'c4'));
    });

    test('proプランは3件を超えても作成できる', async () => {
      await testEnv.seedFirestore(seedUser('pro_user', { plan: 'pro', ccfoliaCharacterCount: 100 }));

      const proDb = testEnv.firestore('pro_user');
      await assertSucceeds(saveCcfoliaCharacterWithCountSync(proDb, 'pro_user', 'c101'));
    });

    test('stale revision とクライアント指定時刻は拒否される', async () => {
      await testEnv.seedFirestore(seedUser('user_1', { ccfoliaCharacterCount: 1 }), seedCharacter('c1'));

      const characterRef = doc(ownerDb, 'users/user_1/ccfoliaCharacters/c1');

      await assertFails(updateDoc(characterRef, { name: 'stale', revision: 1, updatedAt: serverTimestamp() }));
      await assertFails(
        updateDoc(characterRef, {
          name: 'client time',
          revision: 2,
          updatedAt: Timestamp.fromDate(new Date('2026-03-19T00:00:00.000Z')),
        }),
      );
    });
  });

  describe('analyses', () => {
    beforeEach(async () => {
      await testEnv.seedFirestore(seedUser());
    });

    test('所有者は正しい形式の解析ドキュメントを作成できる', async () => {
      await assertSucceeds(saveAnalysisWithCountSync(ownerDb, 'user_1', 'a1'));
    });

    test('SW2.5の解析ドキュメントを作成できる', async () => {
      await assertSucceeds(
        saveAnalysisWithCountSync(ownerDb, 'user_1', 'a1', {
          systemId: 'SwordWorld2.5',
        }),
      );
    });

    test('owner スナップショットが users と不一致なら作成できない', async () => {
      await assertFails(
        saveAnalysisWithCountSync(ownerDb, 'user_1', 'a1', {
          owner: ownerSnapshot({ name: 'Tampered Name' }),
        }),
      );
    });

    test('無料プランは3件まで作成でき、4件目は拒否される', async () => {
      await testEnv.seedFirestore(seedUser('free_user'));

      const freeUserDb = testEnv.firestore('free_user');

      await assertSucceeds(saveAnalysisWithCountSync(freeUserDb, 'free_user', 'a1'));
      await assertSucceeds(saveAnalysisWithCountSync(freeUserDb, 'free_user', 'a2'));
      await assertSucceeds(saveAnalysisWithCountSync(freeUserDb, 'free_user', 'a3'));
      await assertFails(saveAnalysisWithCountSync(freeUserDb, 'free_user', 'a4'));
    });

    test('pro プランは3件を超えても作成できる', async () => {
      await testEnv.seedFirestore(seedUser('pro_user', { plan: 'pro' }));

      const proUserDb = testEnv.firestore('pro_user');
      const proOwner = { owner: ownerSnapshot({ id: 'pro_user', plan: 'pro' }) };

      await assertSucceeds(saveAnalysisWithCountSync(proUserDb, 'pro_user', 'a1', proOwner));
      await assertSucceeds(saveAnalysisWithCountSync(proUserDb, 'pro_user', 'a2', proOwner));
      await assertSucceeds(saveAnalysisWithCountSync(proUserDb, 'pro_user', 'a3', proOwner));
      await assertSucceeds(saveAnalysisWithCountSync(proUserDb, 'pro_user', 'a4', proOwner));
    });

    test('カウンタ同期なしの単独作成は拒否される', async () => {
      await assertFails(setDoc(doc(ownerDb, 'analyses/a1'), analysisDoc('a1', 'user_1')));
    });

    test('解析を削除せず analysisCount だけ減らす更新は拒否される', async () => {
      await testEnv.seedFirestore(seedUser('user_1', { analysisCount: 1 }), seedAnalysis('a1'));

      await assertFails(
        updateDoc(doc(ownerDb, 'users/user_1'), {
          analysisCount: 0,
          analysisCountSyncAnalysisId: 'a1',
          updatedAt: Timestamp.fromDate(new Date('2026-03-18T03:00:00.000Z')),
        }),
      );
    });

    test('全体集計がない解析ドキュメントの作成は拒否される', async () => {
      await assertFails(saveAnalysisWithCountSync(ownerDb, 'user_1', 'a1', { characterResults: [] }));
    });

    test('削除時にカウンタ同期がなければ拒否される', async () => {
      await testEnv.seedFirestore(seedUser('user_1', { analysisCount: 1 }), seedAnalysis('a1'));

      await assertFails(deleteDoc(doc(ownerDb, 'analyses/a1')));
      await assertSucceeds(deleteAnalysisWithCountSync(ownerDb, 'user_1', 'a1'));
    });

    test('可視性設定に応じて読み取り可否が制御される', async () => {
      await testEnv.seedFirestore(
        seedUser('owner'),
        seedAnalysis('private1', 'owner', { visibilityLevel: 'private' }),
        seedAnalysis('unlisted1', 'owner', { visibilityLevel: 'unlisted' }),
        seedAnalysis('public1', 'owner', { visibilityLevel: 'public' }),
      );

      const anonDb = testEnv.anonymousFirestore();

      await assertFails(getDoc(doc(anonDb, 'analyses/private1')));
      await assertSucceeds(getDoc(doc(anonDb, 'analyses/unlisted1')));
      await assertSucceeds(getDoc(doc(anonDb, 'analyses/public1')));
    });

    test('一覧取得は public のみ許可され、unlisted は一覧取得できない', async () => {
      await testEnv.seedFirestore(
        seedUser('owner'),
        seedAnalysis('unlisted1', 'owner', { visibilityLevel: 'unlisted' }),
        seedAnalysis('public1', 'owner', { visibilityLevel: 'public' }),
      );

      const anonDb = testEnv.anonymousFirestore();

      await assertSucceeds(getDocs(query(collection(anonDb, 'analyses'), where('visibilityLevel', '==', 'public'))));
      await assertFails(getDocs(query(collection(anonDb, 'analyses'), where('visibilityLevel', '==', 'unlisted'))));
    });

    test('所有者でも許可されたメタ項目のみ更新できる', async () => {
      await testEnv.seedFirestore(seedAnalysis('a1'));

      await assertSucceeds(
        updateDoc(doc(ownerDb, 'analyses/a1'), {
          title: 'Updated title',
          visibilityLevel: 'public',
          showRecordDetails: true,
          sessionDate: Timestamp.fromDate(new Date('2026-03-17T00:00:00.000Z')),
          updatedAt: Timestamp.fromDate(new Date('2026-03-18T02:00:00.000Z')),
        }),
      );

      await assertFails(
        updateDoc(doc(ownerDb, 'analyses/a1'), {
          sessionDate: null,
          updatedAt: Timestamp.fromDate(new Date('2026-03-18T02:10:00.000Z')),
        }),
      );

      await assertFails(
        updateDoc(doc(ownerDb, 'analyses/a1'), {
          ownerUid: 'user_2',
        }),
      );
    });
  });

  describe('analysisRecords', () => {
    test('Firestore コレクションへのアクセスはすべて拒否される', async () => {
      await testEnv.seedFirestore(seedUser('owner'), seedAnalysis('a1', 'owner'));

      const ownerDb = testEnv.firestore('owner');

      await assertFails(
        setDoc(doc(ownerDb, 'analysisRecords/a1'), {
          analysisId: 'a1',
          ownerUid: 'owner',
          isPublic: false,
        }),
      );
      await assertFails(getDoc(doc(ownerDb, 'analysisRecords/a1')));
      await assertFails(deleteDoc(doc(ownerDb, 'analysisRecords/a1')));
    });
  });

  describe('users と analyses の同期', () => {
    beforeEach(async () => {
      await testEnv.seedFirestore(seedUser(), seedAnalysis('a1'));
    });

    test('name/avatarUrl 更新後に analyses.owner を batch で同期更新できる', async () => {
      await testEnv.seedFirestore(seedAnalysis('a2', 'user_1', { title: 'Session 2' }));

      const updatedAt = Timestamp.fromDate(new Date('2026-03-18T04:00:00.000Z'));

      const userBatch = writeBatch(ownerDb);
      userBatch.update(doc(ownerDb, 'users/user_1'), {
        name: 'Alice Updated',
        avatarUrl: 'https://example.com/avatar-updated.png',
        updatedAt,
      });
      await assertSucceeds(userBatch.commit());

      const analysesBatch = writeBatch(ownerDb);
      analysesBatch.update(doc(ownerDb, 'analyses/a1'), {
        owner: ownerSnapshot({
          name: 'Alice Updated',
          avatarUrl: 'https://example.com/avatar-updated.png',
          updatedAt,
        }),
        updatedAt,
      });
      analysesBatch.update(doc(ownerDb, 'analyses/a2'), {
        owner: ownerSnapshot({
          name: 'Alice Updated',
          avatarUrl: 'https://example.com/avatar-updated.png',
          updatedAt,
        }),
        updatedAt,
      });
      await assertSucceeds(analysesBatch.commit());
    });

    test('users のみ更新する batch は許可される', async () => {
      const batch = writeBatch(ownerDb);
      batch.update(doc(ownerDb, 'users/user_1'), {
        name: 'Alice Updated',
        avatarUrl: 'https://example.com/avatar-updated.png',
        updatedAt: Timestamp.fromDate(new Date('2026-03-18T04:10:00.000Z')),
      });
      await assertSucceeds(batch.commit());
    });

    test('analyses.owner のみ更新して users 同期がない batch は拒否される', async () => {
      const batch = writeBatch(ownerDb);
      batch.update(doc(ownerDb, 'analyses/a1'), {
        owner: ownerSnapshot({
          name: 'Alice Updated',
          avatarUrl: 'https://example.com/avatar-updated.png',
          updatedAt: Timestamp.fromDate(new Date('2026-03-18T04:20:00.000Z')),
        }),
        updatedAt: Timestamp.fromDate(new Date('2026-03-18T04:20:00.000Z')),
      });
      await assertFails(batch.commit());
    });

    test('updateName 相当(users.name + analyses.owner.name 同時更新)は許可される', async () => {
      await testEnv.seedFirestore(seedAnalysis('a2', 'user_1', { title: 'Session 2' }));

      const updatedAt = Timestamp.fromDate(new Date('2026-03-18T04:30:00.000Z'));

      const batch = writeBatch(ownerDb);
      batch.set(doc(ownerDb, 'users/user_1'), { name: 'Alice Updated', updatedAt }, { merge: true });
      batch.set(
        doc(ownerDb, 'analyses/a1'),
        {
          owner: ownerSnapshot({
            name: 'Alice Updated',
            updatedAt,
          }),
          updatedAt,
        },
        { merge: true },
      );
      batch.set(
        doc(ownerDb, 'analyses/a2'),
        {
          owner: ownerSnapshot({
            name: 'Alice Updated',
            updatedAt,
          }),
          updatedAt,
        },
        { merge: true },
      );

      await assertSucceeds(batch.commit());
    });

    test('updateAvatarUrl 相当(users.avatarUrl + analyses.owner.avatarUrl 同時更新)は許可される', async () => {
      await testEnv.seedFirestore(seedAnalysis('a2', 'user_1', { title: 'Session 2' }));

      const updatedAt = Timestamp.fromDate(new Date('2026-03-18T04:40:00.000Z'));

      const batch = writeBatch(ownerDb);
      batch.set(
        doc(ownerDb, 'users/user_1'),
        {
          avatarUrl: 'https://example.com/avatar-updated.png',
          updatedAt,
        },
        { merge: true },
      );
      batch.set(
        doc(ownerDb, 'analyses/a1'),
        {
          owner: ownerSnapshot({
            avatarUrl: 'https://example.com/avatar-updated.png',
            updatedAt,
          }),
          updatedAt,
        },
        { merge: true },
      );
      batch.set(
        doc(ownerDb, 'analyses/a2'),
        {
          owner: ownerSnapshot({
            avatarUrl: 'https://example.com/avatar-updated.png',
            updatedAt,
          }),
          updatedAt,
        },
        { merge: true },
      );

      await assertSucceeds(batch.commit());
    });
  });

  describe('Storage セキュリティルール', () => {
    let ownerStorage: ReturnType<typeof testEnv.storage>;

    beforeEach(() => {
      ownerStorage = testEnv.storage('owner');
    });

    describe('analysis-records', () => {
      test('所有者は自分のパスへ JSON を書き込める', async () => {
        await assertSucceeds(
          ownerStorage
            .ref('analysis-records/owner/a1')
            .putString('{"characterRecords":[]}', 'raw', {
              contentType: 'application/json; charset=utf-8',
              customMetadata: {
                visibilityLevel: 'private',
                showRecordDetails: 'false',
              },
            })
            .then(() => undefined),
        );
      });

      test('他人のパスへの書き込みは拒否される', async () => {
        const otherStorage = testEnv.storage('other');

        await assertFails(
          otherStorage
            .ref('analysis-records/owner/a1')
            .putString('{"characterRecords":[]}', 'raw', {
              contentType: 'application/json; charset=utf-8',
              customMetadata: {
                visibilityLevel: 'private',
                showRecordDetails: 'false',
              },
            })
            .then(() => undefined),
        );
      });

      test('公開設定 metadata がない書き込みは拒否される', async () => {
        await assertFails(
          ownerStorage
            .ref('analysis-records/owner/a1')
            .putString('{"characterRecords":[]}', 'raw', { contentType: 'application/json' })
            .then(() => undefined),
        );
      });

      test('metadata に visibilityLevel=public + showRecordDetails=true が埋め込まれている場合、他ユーザーも読み取りできる', async () => {
        const analysisId = 'storage_public_detail_true';

        await assertSucceeds(
          ownerStorage
            .ref(`analysis-records/owner/${analysisId}`)
            .putString('{"characterRecords":[]}', 'raw', {
              contentType: 'application/json; charset=utf-8',
              customMetadata: {
                visibilityLevel: 'public',
                showRecordDetails: 'true',
              },
            })
            .then(() => undefined),
        );

        const otherStorage = testEnv.storage('other');
        await assertSucceeds(otherStorage.ref(`analysis-records/owner/${analysisId}`).getMetadata());
      });

      test('metadata に visibilityLevel=public + showRecordDetails=false が埋め込まれている場合、他ユーザーは読み取りできない', async () => {
        const analysisId = 'storage_public_detail_false';

        await assertSucceeds(
          ownerStorage
            .ref(`analysis-records/owner/${analysisId}`)
            .putString('{"characterRecords":[]}', 'raw', {
              contentType: 'application/json; charset=utf-8',
              customMetadata: {
                visibilityLevel: 'public',
                showRecordDetails: 'false',
              },
            })
            .then(() => undefined),
        );

        const anonStorage = testEnv.anonymousStorage();
        await assertFails(anonStorage.ref(`analysis-records/owner/${analysisId}`).getMetadata());
      });

      test('metadata に visibilityLevel=unlisted + showRecordDetails=true が埋め込まれている場合、他ユーザーも読み取りできる', async () => {
        const analysisId = 'storage_unlisted_detail_true';

        await assertSucceeds(
          ownerStorage
            .ref(`analysis-records/owner/${analysisId}`)
            .putString('{"characterRecords":[]}', 'raw', {
              contentType: 'application/json; charset=utf-8',
              customMetadata: {
                visibilityLevel: 'unlisted',
                showRecordDetails: 'true',
              },
            })
            .then(() => undefined),
        );

        const otherStorage = testEnv.storage('other');
        await assertSucceeds(otherStorage.ref(`analysis-records/owner/${analysisId}`).getMetadata());
      });

      test('metadata に visibilityLevel=private + showRecordDetails=true が埋め込まれている場合、他ユーザーは読み取りできない', async () => {
        const analysisId = 'storage_private_detail_true';

        await assertSucceeds(
          ownerStorage
            .ref(`analysis-records/owner/${analysisId}`)
            .putString('{"characterRecords":[]}', 'raw', {
              contentType: 'application/json; charset=utf-8',
              customMetadata: {
                visibilityLevel: 'private',
                showRecordDetails: 'true',
              },
            })
            .then(() => undefined),
        );

        const anonStorage = testEnv.anonymousStorage();
        await assertFails(anonStorage.ref(`analysis-records/owner/${analysisId}`).getMetadata());
      });
    });

    describe('analysis-og-images', () => {
      test('所有者は ownerUid metadata を持つ画像を書き込める', async () => {
        await assertSucceeds(
          ownerStorage
            .ref('analysis-og-images/a1')
            .putString('data:image/png;base64,AA==', 'data_url', {
              contentType: 'image/png',
              customMetadata: {
                ownerUid: 'owner',
                visibilityLevel: 'private',
              },
            })
            .then(() => undefined),
        );
      });

      test('ownerUid metadata が認証ユーザーと不一致なら拒否される', async () => {
        const otherStorage = testEnv.storage('other');

        await assertFails(
          otherStorage
            .ref('analysis-og-images/a1')
            .putString('data:image/png;base64,AA==', 'data_url', {
              contentType: 'image/png',
              customMetadata: {
                ownerUid: 'owner',
                visibilityLevel: 'private',
              },
            })
            .then(() => undefined),
        );
      });

      test('visibilityLevel=public なら他ユーザーが読み取りできる', async () => {
        const analysisId = 'og_public';

        await assertSucceeds(
          ownerStorage
            .ref(`analysis-og-images/${analysisId}`)
            .putString('data:image/png;base64,AA==', 'data_url', {
              contentType: 'image/png',
              customMetadata: {
                ownerUid: 'owner',
                visibilityLevel: 'public',
              },
            })
            .then(() => undefined),
        );

        const otherStorage = testEnv.storage('other');
        await assertSucceeds(otherStorage.ref(`analysis-og-images/${analysisId}`).getMetadata());
      });

      test('visibilityLevel=private なら他ユーザーは読み取りできない', async () => {
        const analysisId = 'og_private';

        await assertSucceeds(
          ownerStorage
            .ref(`analysis-og-images/${analysisId}`)
            .putString('data:image/png;base64,AA==', 'data_url', {
              contentType: 'image/png',
              customMetadata: {
                ownerUid: 'owner',
                visibilityLevel: 'private',
              },
            })
            .then(() => undefined),
        );

        const anonStorage = testEnv.anonymousStorage();
        await assertFails(anonStorage.ref(`analysis-og-images/${analysisId}`).getMetadata());
      });
    });

    describe('shared-images', () => {
      test('認証済みユーザーだけが PNG を書き込める', async () => {
        const anonStorage = testEnv.anonymousStorage();

        await assertSucceeds(
          ownerStorage
            .ref('shared-images/log-analysis/authenticated.png')
            .putString('data:image/png;base64,AA==', 'data_url', { contentType: 'image/png' })
            .then(() => undefined),
        );
        await assertFails(
          anonStorage
            .ref('shared-images/log-analysis/anonymous.png')
            .putString('data:image/png;base64,AA==', 'data_url', { contentType: 'image/png' })
            .then(() => undefined),
        );
        await assertFails(
          ownerStorage
            .ref('shared-images/log-analysis/vector.svg')
            .putString('<svg></svg>', 'raw', { contentType: 'image/svg+xml' })
            .then(() => undefined),
        );
      });
    });

    describe('avatars', () => {
      test('所有者は 1MiB 以下の JPEG/PNG/WebP を書き込める', async () => {
        await assertSucceeds(
          ownerStorage
            .ref('avatars/owner/profile.png')
            .put(new Uint8Array(1 * 1024 * 1024), {
              contentType: 'image/png',
            })
            .then(() => undefined),
        );
      });

      test('1MiB を超える書き込みは拒否される', async () => {
        await assertFails(
          ownerStorage
            .ref('avatars/owner/too-large.png')
            .put(new Uint8Array(1 * 1024 * 1024 + 1), {
              contentType: 'image/png',
            })
            .then(() => undefined),
        );
      });

      test('非対応のファイル形式は拒否される', async () => {
        await assertFails(
          ownerStorage
            .ref('avatars/owner/unsupported.gif')
            .putString('gif-data', 'raw', {
              contentType: 'image/gif',
            })
            .then(() => undefined),
        );
      });
    });

    test('avatars と analysis-records と analysis-og-images の list 操作は拒否される', async () => {
      await assertSucceeds(
        ownerStorage
          .ref('avatars/owner')
          .putString('avatar', 'raw', {
            contentType: 'image/png',
          })
          .then(() => undefined),
      );
      await assertSucceeds(
        ownerStorage
          .ref('analysis-records/owner/a1')
          .putString('{"characterRecords":[]}', 'raw', {
            contentType: 'application/json; charset=utf-8',
            customMetadata: {
              visibilityLevel: 'private',
              showRecordDetails: 'false',
            },
          })
          .then(() => undefined),
      );
      await assertSucceeds(
        ownerStorage
          .ref('analysis-og-images/a1')
          .putString('data:image/png;base64,AA==', 'data_url', {
            contentType: 'image/png',
            customMetadata: {
              ownerUid: 'owner',
              visibilityLevel: 'private',
            },
          })
          .then(() => undefined),
      );

      await assertFails(storageList(storageRef(ownerStorage, 'avatars')));
      await assertFails(storageList(storageRef(ownerStorage, 'analysis-records/owner')));
      await assertFails(storageList(storageRef(ownerStorage, 'analysis-og-images')));
    });
  });
});
