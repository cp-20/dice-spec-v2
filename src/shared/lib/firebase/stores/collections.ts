import { type FieldValue, Timestamp } from 'firebase/firestore';
import * as v from 'valibot';
import type {
  DiceResultForCharacter,
  System,
} from '@/app/[locale]/(app)/analyze-logs/_components/hooks/ccfoliaLogAnalysis';
import type { MessageParserResult } from '@/app/[locale]/(app)/analyze-logs/_components/hooks/ccfoliaLogAnalysis/messageParser';

export const COLLECTIONS = {
  users: 'users',
  analyses: 'analyses',
  analysisRecords: 'analysisRecords',
} as const;

// userStore

export const userPlanSchema = v.union([v.literal('free'), v.literal('pro')]);

export type UserPlan = v.InferOutput<typeof userPlanSchema>;

export const publicUserSchema = v.object({
  name: v.string(),
  avatarUrl: v.optional(v.string()),
  plan: userPlanSchema,
  createdAt: v.instance(Timestamp),
  updatedAt: v.instance(Timestamp),
});

export type PublicUser = v.InferOutput<typeof publicUserSchema>;

export const userStoreSchema = v.object({
  ...publicUserSchema.entries,
  stripeCustomerId: v.string(),
  analysisCount: v.number(),
  analysisCountSyncAnalysisId: v.nullable(v.string()),
});

export type UserDocument = v.InferOutput<typeof userStoreSchema>;

export type NewUserDocument = Omit<UserDocument, 'createdAt' | 'updatedAt'> & {
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

// analysesStore

export const analysisVisibilityLevelSchema = v.union([
  v.literal('private'),
  v.literal('unlisted'),
  v.literal('public'),
]);

export type AnalysisVisibilityLevel = v.InferOutput<typeof analysisVisibilityLevelSchema>;

const characterResultSummaryRecordSchema = v.object({
  evaluation: v.string(),
  results: v.array(v.number()),
  target: v.number(),
  skillName: v.optional(v.string()),
  evaluationStatus: v.union([v.literal('success'), v.literal('failure'), v.literal('other')]),
});

const analysisSummarySchema = v.object({
  average: v.number(),
  deviationScore: v.number(),
  successRate: v.number(),
  diceRollCount: v.number(),
  diceCount: v.number(),
});

const characterResultSchema = v.object({
  id: v.string(),
  name: v.string(),
  summary: analysisSummarySchema,
  summaryRecords: v.array(characterResultSummaryRecordSchema),
});

const analysisSystemSchema = v.union([
  v.literal('emoklore'),
  v.literal('CoC7th'),
  v.literal('CoC6th'),
  v.literal('shinobigami'),
]);

export const analysesStoreSchema = v.object({
  id: v.string(),
  title: v.string(),
  ownerUid: v.string(),
  systemId: analysisSystemSchema,
  visibilityLevel: analysisVisibilityLevelSchema,
  showRecordDetails: v.boolean(),
  characterResults: v.array(characterResultSchema),
  sessionDate: v.instance(Timestamp),
  createdAt: v.instance(Timestamp),
  updatedAt: v.instance(Timestamp),
  // ALL_CHARACTER_ID の偏差値
  primaryDeviationScore: v.number(),
  // relation
  owner: publicUserSchema,
});

export type AnalysisDocument = v.InferOutput<typeof analysesStoreSchema>;

export type NewAnalysisDocument = Omit<AnalysisDocument, 'createdAt' | 'updatedAt'> & {
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

export type AssertEqual<T, Expected> = T extends Expected ? (Expected extends T ? unknown : never) : never;

const _testAnalysisSystemType: AssertEqual<AnalysisDocument['systemId'], System> = true;

const _testAnalysisResultsType: AssertEqual<
  AnalysisDocument['characterResults'][number],
  Omit<DiceResultForCharacter, 'results'> & { summaryRecords: MessageParserResult[] }
> = true;

// analysisRecordsStore

const characterResultRecordSchema = v.object({
  ...characterResultSummaryRecordSchema.entries,
  fullStr: v.string(),
});

export const analysisRecordsSchema = v.object({
  analysisId: v.string(),
  ownerUid: v.string(),
  isPublic: v.boolean(),
  characterRecords: v.array(
    v.object({
      characterId: v.string(),
      records: v.array(characterResultRecordSchema),
    }),
  ),
});

export type AnalysisRecordsDocument = v.InferOutput<typeof analysisRecordsSchema>;

const _testAnalysisRecordType: AssertEqual<
  v.InferOutput<typeof analysisRecordsSchema>['characterRecords'][number]['records'][number],
  DiceResultForCharacter['results'][number]
> = true;
