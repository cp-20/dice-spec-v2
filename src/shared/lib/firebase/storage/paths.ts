export const SHARED_IMAGE_SCOPES = {
  'analyze-logs': 'analyze-logs',
} as const;

export type SharedImageScope = (typeof SHARED_IMAGE_SCOPES)[keyof typeof SHARED_IMAGE_SCOPES];

export const storagePaths = {
  getAvatarPath: (uid: string) => `avatars/${uid}/avatar`,
  getSharedImagePath: (scope: SharedImageScope, imageId: string) => `shared-images/${scope}/${imageId}`,
  getAnalysisRecordsPath: (ownerUid: string, analysisId: string) => `analysis-records/${ownerUid}/${analysisId}`,
  getAnalysisOgImagePath: (analysisId: string) => `analysis-og-images/${analysisId}`,
} as const;
