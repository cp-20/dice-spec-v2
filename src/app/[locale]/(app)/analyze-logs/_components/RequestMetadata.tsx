import { connection } from 'next/server';

// URLやStorageで変わるメタデータだけをリクエスト時に確定させる。
export const RequestMetadata = async () => {
  await connection();
  return null;
};
