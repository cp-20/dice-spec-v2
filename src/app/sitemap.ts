import type { MetadataRoute } from 'next';

import { contents } from '@/app/blogs/[category]/[slug]/_contents/contents';
import { constructUrl } from '@/shared/lib/metadataGenerator';
import { navLinks } from '@/shared/lib/navigation';

const appPaths = [
  '/',
  // 解析一覧は noindex のため、サイトマップには載せない。
  ...navLinks.map((link) => link.href).filter((href) => href !== '/analyze-logs/list'),
  '/terms',
  '/privacy-policy',
  '/specified-commercial-transactions',
  '/blogs',
  ...contents.map((category) => `/blogs/${category.category}`),
];

const blogEntries = contents.flatMap((category) =>
  category.articles.flatMap((article) =>
    article.isPublished
      ? [{ url: constructUrl(`/blogs/${category.category}/${article.slug}`), lastModified: article.updatedAt }]
      : [],
  ),
);

export default function sitemap(): MetadataRoute.Sitemap {
  return [...appPaths.map((path) => ({ url: constructUrl(path) })), ...blogEntries];
}
