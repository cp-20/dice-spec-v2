import type { FC } from 'react';

// `</script>` で構造化データが途切れないよう、`<` をエスケープして埋め込む。
export const JsonLd: FC<{ data: Record<string, unknown> }> = ({ data }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replaceAll('<', '\\u003c') }}
  />
);
