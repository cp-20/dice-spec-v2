import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  // PPR の動的部分を Next.js で再開するため、静的シェルだけを返す cache interception は無効にする。
  enableCacheInterception: false,
});
