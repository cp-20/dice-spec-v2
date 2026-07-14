import type { AnalysisVisibilityLevel } from '../collections';

export type AnalysisRecordsPrivacy = {
  visibilityLevel: AnalysisVisibilityLevel;
  showRecordDetails: boolean;
};

const canReadAnalysisRecords = (privacy: AnalysisRecordsPrivacy) =>
  privacy.visibilityLevel !== 'private' && privacy.showRecordDetails;

export const shouldCloseAnalysisRecordsBeforeFirestore = (
  previous: AnalysisRecordsPrivacy,
  next: AnalysisRecordsPrivacy,
) => canReadAnalysisRecords(previous) && !canReadAnalysisRecords(next);
