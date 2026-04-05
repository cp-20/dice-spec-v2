import { t } from 'i18next';
import type { FC } from 'react';

import { BlogCard } from '@/app/[locale]/blogs/_components/BlogCard';

export const BlogCallout: FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 shadow-lg rounded-md overflow-hidden">
      <div className="bg-slate-900 p-8">
        <div className="text-2xl font-bold text-slate-50">{t('common:blog-callout.title')}</div>
        <div className="text-slate-300 text-sm mt-4">
          <ul className="list-disc pl-4 space-y-1">
            <li>{t('common:blog-callout.points.0')}</li>
            <li>{t('common:blog-callout.points.1')}</li>
            <li>{t('common:blog-callout.points.2')}</li>
          </ul>
        </div>
      </div>
      <div className="p-8 grid place-items-center">
        <BlogCard category="stats-for-trpg" slug="1-introduction" />
      </div>
    </div>
  );
};
