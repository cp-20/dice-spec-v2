import type { MetadataRoute } from 'next';
import { contents } from '@/app/[locale]/blogs/[category]/[slug]/_contents/contents';
import { i18nConfig } from '@/shared/i18n/config';
import { constructAlternateUrls, constructLocaleUrl } from '@/shared/lib/metadataGenerator';
import { navLinks } from '@/shared/lib/navigation';

const appPaths = ['/', ...navLinks.map((link) => link.href)];

const blogPaths = contents.flatMap((category) =>
  category.articles.map((article) => `/blogs/${category.category}/${article.slug}`),
);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...i18nConfig.locales.flatMap((locale) => [
      ...appPaths.map((path) => ({
        url: constructLocaleUrl(path, locale),
        alternates: {
          languages: constructAlternateUrls(path, locale),
        },
      })),
    ]),
    ...blogPaths.map((path) => ({
      url: constructLocaleUrl(path, 'ja'),
    })),
  ];
}
