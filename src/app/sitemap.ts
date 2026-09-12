import type { MetadataRoute } from 'next';

import { contents } from '@/app/blogs/[category]/[slug]/_contents/contents';
import { constructUrl } from '@/shared/lib/metadataGenerator';
import { navLinks } from '@/shared/lib/navigation';

const appPaths = [
  '/',
  ...navLinks.map((link) => link.href),
  '/terms',
  '/privacy-policy',
  '/specified-commercial-transactions',
];

const blogPaths = contents.flatMap((category) =>
  category.articles.map((article) => `/blogs/${category.category}/${article.slug}`),
);

export default function sitemap(): MetadataRoute.Sitemap {
  return [...appPaths, ...blogPaths].map((path) => ({ url: constructUrl(path) }));
}
