import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { BlogCard } from './_components/BlogCard';
import { contents } from './[category]/[slug]/_contents/contents';

const BlogTopPage = () => {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-bold mb-4">ブログトップ</h1>

      <div className="space-y-16">
        {contents.map((category) => (
          <div key={category.category}>
            <h2 className="text-xl font-bold mb-1">
              <Link href={`/blogs/${category.category}`} className="flex items-center gap-1 text-blue-500 underline">
                <span>{category.name}</span>
                <IconChevronRight />
              </Link>
            </h2>
            <p className="text-sm text-gray-500 mb-4">{category.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {category.articles.map((article) => (
                <BlogCard key={article.slug} category={category.category} slug={article.slug} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogTopPage;
