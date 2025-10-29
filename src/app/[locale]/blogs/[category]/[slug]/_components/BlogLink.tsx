import { IconChevronRight } from '@tabler/icons-react';
import Image from 'next/image';
import { CustomLink } from '@/shared/components/elements/CustomLink';
import { contents } from '../_contents/contents';

type Props = {
  category: string;
  slug: string;
};

export const BlogLink: React.FC<Props> = ({ category, slug }) => {
  const categoryContents = contents.find((c) => c.category === category);
  if (!categoryContents) throw new Error(`Category not found: ${category}`);
  const article = categoryContents.articles.find((a) => a.slug === slug);
  if (!article) throw new Error(`Article not found: ${category}/${slug}`);

  if (!article.isPublished) {
    return (
      <div className="w-full flex flex-col border rounded-md overflow-hidden">
        <div className="w-full aspect-1200/630 relative">
          <Image src={`/assets/blog-images/og/${category}/${slug}.png`} alt={article.title} fill />
        </div>
        <div className="flex justify-end items-center px-4 py-2 bg-slate-50">
          <span className="text-gray-600 font-semibold flex items-center gap-1">
            <span>次回はまだ公開されていません</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <CustomLink
      href={`/blogs/${category}/${slug}`}
      className="w-full flex flex-col border rounded-md overflow-hidden group hover:opacity-70 transition"
    >
      <div className="w-full aspect-1200/630 relative">
        <Image src={`/assets/blog-images/og/${category}/${slug}.png`} alt={article.title} fill />
      </div>
      <div className="flex justify-end items-center px-4 py-2 bg-slate-50">
        <span className="text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
          <span>次へ</span>
          <IconChevronRight className="size-5" />
        </span>
      </div>
    </CustomLink>
  );
};
