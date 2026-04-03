export const storagePaths = {
  getAvatarPath: (uid: string) => `avatars/${uid}/avatar`,
  getSharedImagePath: (scope: string, imageId: string) => `shared-images/${scope}/${imageId}`,
  getAnalysisRecordsPath: (ownerUid: string, analysisId: string) => `analysis-records/${ownerUid}/${analysisId}`,
} as const;
