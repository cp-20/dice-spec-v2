import type { Metadata } from 'next';
import Image from 'next/image';
import { BlogBreadCrumb } from '@/app/[locale]/blogs/_components/BlogBreadCrumb';
import { appBaseUrl } from '@/shared/lib/metadataGenerator';
import { contents } from './_contents/contents';

type Params = {
  category: string;
  slug: string;
};

export const generateMetadata = async ({ params }: { params: Promise<Params> }): Promise<Metadata> => {
  const { slug, category } = await params;
  const cat = contents.find((c) => c.category === category);
  const article = cat?.articles.find((a) => a.slug === slug);
  if (!article) throw new Error(`Article not found: ${category}/${slug}`);
  const { title, description } = article;

  const og = `${appBaseUrl}/assets/blog-images/og/${category}/${slug}.png`;

  return {
    title: `${title} - ダイススペックブログ`,
    description,
    metadataBase: new URL(appBaseUrl),
    openGraph: {
      title,
      description,
      type: 'article',
      locale: 'ja',
      siteName: `${title} - ダイススペックブログ`,
      images: og,
      url: `${appBaseUrl}/blogs/${category}/${slug}`,
      publishedTime: article.isPublished ? article.publishedAt.toISOString() : undefined,
      modifiedTime: article.isPublished ? article.updatedAt.toISOString() : undefined,
    },
    manifest: '/manifest.webmanifest',
    icons: [
      {
        rel: 'icon',
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        rel: 'icon',
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
      {
        rel: 'apple-touch-icon',
        url: '/apple-touch-icon.png',
      },
    ],
    twitter: {
      title,
      description,
      images: og,
      card: 'summary_large_image',
      site: '@__cp20__',
    },
  };
};

const formatDate = (date: Date) => date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug, category } = await params;
  const cat = contents.find((c) => c.category === category);
  const article = cat?.articles.find((a) => a.slug === slug);
  if (!article) throw new Error(`Article not found: ${category}/${slug}`);

  const Post = (await import(`./_contents/${category}/${slug}.mdx`)).default;

  return (
    <div className="max-w-2xl mx-auto pt-8 sm:px-8 px-4 pb-32 w-screen">
      <div className="mb-8">
        <BlogBreadCrumb category={category} slug={slug} />
      </div>
      <div className="relative w-full aspect-[1200/630] mb-8 border border-slate-50">
        <Image src={`/assets/blog-images/og/${category}/${slug}.png`} alt="" fill objectFit="contain" />
      </div>
      <div className="text-slate-500 flex flex-col gap-1 items-end mb-8">
        <div>投稿日: {article.isPublished ? formatDate(article.publishedAt) : '未公開'}</div>
        <div>最終更新日: {article.isPublished ? formatDate(article.updatedAt) : '未公開'}</div>
      </div>
      <Post />
      <footer className="mt-8">
        <div className="text-slate-500 text-sm">
          ※本文中の挿絵には{' '}
          <a href="https://twitter.com/sora_douhu" className="underline hover:text-slate-600">
            空どうふ (@sora_douhu)
          </a>{' '}
          さんの{' '}
          <a href="https://seiga.nicovideo.jp/seiga/im11640678" className="underline hover:text-slate-600">
            ピョコピョコしてる足立レイ立ち絵素材
          </a>{' '}
          を一部加工してお借りしています
        </div>
      </footer>
    </div>
  );
}

export const generateStaticParams = async () => {
  return contents.flatMap(({ category, articles }) =>
    articles.map((article) => ({ category, slug: article.slug, locale: 'ja' })),
  );
};

export const dynamicParams = false;
