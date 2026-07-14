const FIRESTORE_BATCH_WRITE_LIMIT = 500;

// 各バッチで users も1回更新するため、解析に使える書き込み数は499件。
export const MAX_ANALYSES_PER_PROFILE_BATCH = FIRESTORE_BATCH_WRITE_LIMIT - 1;

export const splitProfileUpdateBatches = <T>(analyses: T[]): T[][] => {
  const batches: T[][] = [];
  for (let index = 0; index < analyses.length; index += MAX_ANALYSES_PER_PROFILE_BATCH) {
    batches.push(analyses.slice(index, index + MAX_ANALYSES_PER_PROFILE_BATCH));
  }
  return batches.length > 0 ? batches : [[]];
};
