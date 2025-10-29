import type { FC } from 'react';
import { contents } from '@/app/[locale]/blogs/[category]/[slug]/_contents/contents';
import { CustomLink } from '@/shared/components/elements/CustomLink';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';

type BlogBreadcrumbProps = {
  category: string;
  slug: string;
};

export const BlogBreadCrumb: FC<BlogBreadcrumbProps> = ({ category, slug }) => {
  const contentCategory = contents.find((c) => c.category === category);
  if (!contentCategory) throw new Error(`Category not found: ${category}`);
  const article = contentCategory.articles.find((a) => a.slug === slug);
  if (!article) throw new Error(`Article not found: ${slug}`);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild href="/blogs">
            <CustomLink href="/blogs">ブログトップ</CustomLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild href={`/blogs/${category}`}>
            <CustomLink href={`/blogs/${category}`}>{contentCategory.name}</CustomLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{article.title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};

type CategoryBreadCrumbProps = {
  category: string;
};

export const CategoryBreadCrumb: FC<CategoryBreadCrumbProps> = ({ category }) => {
  const contentCategory = contents.find((c) => c.category === category);
  if (!contentCategory) throw new Error(`Category not found: ${category}`);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild href="/blogs">
            <CustomLink href="/blogs">ブログトップ</CustomLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{contentCategory.name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
