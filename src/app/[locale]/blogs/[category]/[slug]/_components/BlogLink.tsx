import { IconChevronRight } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { contents } from '../_contents/contents';

type Props = {
  category: string;
  slug: string;
};

export const BlogLink: React.FC<Props> = ({ category, slug }) => {
  const categoryContents = contents.find((c) => c.category === category);
  const title = categoryContents?.articles.find((a) => a.slug === slug)?.title;
  return (
    <Link
      href={`/blogs/${category}/${slug}`}
      className="w-full flex flex-col border rounded-md overflow-hidden group hover:opacity-70 transition"
    >
      <div className="w-full aspect-[1200/630] relative">
        <Image src={`/assets/blog-images/og/${category}/${slug}.png`} alt={title ?? ''} fill />
      </div>
      <div className="flex justify-end items-center px-4 py-2 bg-slate-50">
        <span className="text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
          <span>次へ</span>
          <IconChevronRight className="size-5" />
        </span>
      </div>
    </Link>
  );
};
