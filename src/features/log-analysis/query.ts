import type { System } from './model';

export const ALL_SYSTEM_ID = 'all-systems' as const;

export type AnalysisSystemFilter = System | typeof ALL_SYSTEM_ID;

export type AnalysisSort = 'newest' | 'oldest' | 'deviationScoreDesc' | 'deviationScoreAsc';
