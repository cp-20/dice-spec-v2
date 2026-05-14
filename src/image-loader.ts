import type { ImageLoaderProps } from 'next/image';

import { buildEnv } from '@/shared/lib/env';

const normalizeSrc = (src: string) => {
  return src.startsWith('/') ? src.slice(1) : src;
};

export default function cloudflareLoader({ src, width, quality }: ImageLoaderProps) {
  const params = [`width=${width}`];
  if (quality) {
    params.push(`quality=${quality}`);
  }
  if (buildEnv.nodeEnv === 'development') {
    // Serve the original image when using `next dev`
    return `${src}?${params.join('&')}`;
  }
  return `/cdn-cgi/image/${params.join(',')}/${normalizeSrc(src)}`;
}
