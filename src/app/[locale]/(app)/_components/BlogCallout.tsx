import type { FC } from 'react';
import { BlogCard } from '@/app/[locale]/blogs/_components/BlogCard';

// TODO: support i18n
export const BlogCallout: FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 shadow-lg rounded-md overflow-hidden">
      <div className="bg-slate-900 p-8">
        <div className="text-2xl font-bold text-slate-50">「TRPGプレイヤーのための確率統計」好評連載中！</div>
        <div className="text-slate-300 text-sm mt-4">
          <ul className="list-disc pl-4 space-y-1">
            <li>確率・統計をTRPGプレイヤー向けに全6回でふわっと解説！</li>
            <li>読みやすさ第一で書かれてるからサクッと読めちゃう！</li>
            <li>なのに今日から役立つ知識がたくさん手に入るかも！</li>
          </ul>
        </div>
      </div>
      <div className="p-8 grid place-items-center">
        <BlogCard category="stats-for-trpg" slug="1-introduction" />
      </div>
    </div>
  );
};
