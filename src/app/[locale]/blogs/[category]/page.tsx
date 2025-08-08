import { CategoryBreadCrumb } from '../_components/BlogBreadCrumb';
import { BlogCard } from '../_components/BlogCard';
import { contents } from './[slug]/_contents/contents';

type Params = {
  category: string;
};

const CategoryPage = async ({ params }: { params: Promise<Params> }) => {
  const { category } = await params;
  const currentCategory = contents.find((c) => c.category === category);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-4">
        <CategoryBreadCrumb category={category} />
      </div>
      <h1 className="text-3xl font-bold mb-4">{currentCategory?.name}</h1>
      <p className="text-gray-600 mb-6">{currentCategory?.description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {currentCategory?.articles.map((article) => (
          <BlogCard key={article.slug} category={category} slug={article.slug} />
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
