import Image from 'next/image';
import { Link } from 'nextjs13-progress';
import type { FC } from 'react';
import { contents } from '../[category]/[slug]/_contents/contents';

type BlogCardProps = {
  category: string;
  slug: string;
};

export const BlogCard: FC<BlogCardProps> = ({ category, slug }) => {
  const article = contents.find((c) => c.category === category)?.articles.find((a) => a.slug === slug);
  if (!article) throw new Error('Article not found');

  return (
    <Link
      href={`/blogs/${category}/${slug}`}
      className="w-full flex flex-col border rounded-md overflow-hidden group hover:opacity-70 transition"
    >
      <div className="w-full aspect-[1200/630] relative">
        <Image src={`/assets/blog-images/og/${category}/${slug}.png`} alt={article.title ?? ''} fill />
      </div>
      <div className="px-4 py-2 bg-slate-50 flex flex-col gap-1 flex-1">
        <div className="text-slate-700 font-bold">{article.shortTitle}</div>
        <div className="text-slate-400 text-xs">{article.description}</div>
      </div>
    </Link>
  );
};
