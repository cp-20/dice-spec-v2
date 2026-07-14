import { type FieldValue, Timestamp } from 'firebase/firestore';
import * as v from 'valibot';

import { ALL_CHARACTER_ID, type DiceResultForCharacter, type MessageParserResult, type System } from '../model';

const analysisVisibilityLevelSchema = v.union([v.literal('private'), v.literal('unlisted'), v.literal('public')]);

export type AnalysisVisibilityLevel = v.InferOutput<typeof analysisVisibilityLevelSchema>;

const analysisOwnerSchema = v.object({
  id: v.string(),
  name: v.string(),
  avatarUrl: v.optional(v.string()),
  plan: v.union([v.literal('free'), v.literal('pro')]),
  createdAt: v.instance(Timestamp),
  updatedAt: v.instance(Timestamp),
});

const characterResultSummaryRecordSchema = v.object({
  evaluation: v.string(),
  results: v.array(v.number()),
  target: v.number(),
  skillName: v.nullable(v.string()),
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
  v.literal('nechronica'),
]);

export const analysisDocumentSchema = v.pipe(
  v.object({
    id: v.string(),
    title: v.string(),
    ownerUid: v.string(),
    systemId: analysisSystemSchema,
    visibilityLevel: analysisVisibilityLevelSchema,
    showRecordDetails: v.boolean(),
    characterResults: v.pipe(v.array(characterResultSchema), v.minLength(1)),
    sessionDate: v.instance(Timestamp),
    createdAt: v.instance(Timestamp),
    updatedAt: v.instance(Timestamp),
    primaryDeviationScore: v.number(),
    owner: analysisOwnerSchema,
  }),
  v.check(
    (analysis) =>
      analysis.characterResults[0]?.id === ALL_CHARACTER_ID &&
      analysis.characterResults[0].summary.deviationScore === analysis.primaryDeviationScore,
    '全体集計が解析結果の先頭に必要です',
  ),
);

export type AnalysisDocument = v.InferOutput<typeof analysisDocumentSchema>;

export const parseAnalysisDocument = (data: unknown): AnalysisDocument | null => {
  const result = v.safeParse(analysisDocumentSchema, data);
  return result.success ? result.output : null;
};

export type NewAnalysisDocument = Omit<AnalysisDocument, 'createdAt' | 'updatedAt'> & {
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

type AssertEqual<T, Expected> = T extends Expected ? (Expected extends T ? unknown : never) : never;

const _testAnalysisSystemType: AssertEqual<AnalysisDocument['systemId'], System> = true;

const _testAnalysisResultsType: AssertEqual<
  AnalysisDocument['characterResults'][number],
  Omit<DiceResultForCharacter, 'results'> & { summaryRecords: MessageParserResult[] }
> = true;

const characterResultRecordSchema = v.object({
  ...characterResultSummaryRecordSchema.entries,
  fullStr: v.string(),
});

export const analysisRecordsContentSchema = v.object({
  characterRecords: v.array(
    v.object({
      characterId: v.string(),
      records: v.array(characterResultRecordSchema),
    }),
  ),
});

export type AnalysisRecordsDocument = v.InferOutput<typeof analysisRecordsContentSchema>;

const _testAnalysisRecordType: AssertEqual<
  AnalysisRecordsDocument['characterRecords'][number]['records'][number],
  DiceResultForCharacter['results'][number]
> = true;
