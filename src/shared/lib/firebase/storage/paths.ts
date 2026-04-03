export const storagePaths = {
  getAvatarPath: (uid: string) => `avatars/${uid}`,
  getAnalysisRecordsPath: (ownerUid: string, analysisId: string) => `analysis-records/${ownerUid}/${analysisId}`,
} as const;
