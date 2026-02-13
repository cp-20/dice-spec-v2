import { t } from 'i18next';
import type { NextPage } from 'next';
import Link from 'next/link';
import { Footer } from '@/shared/components/Layout/Footer';
import { wrapPage } from '@/shared/i18n/page-layout';
import {
  localeHelper,
  type MetadataGenerator,
  metadataHelper,
  viewportGenerator,
} from '@/shared/lib/metadataGenerator';

export const generateMetadata: MetadataGenerator = async (props) => {
  const locale = await localeHelper(props);
  const title = t('legal:privacy.metadata.title');
  const description = t('legal:privacy.metadata.description');

  return metadataHelper({
    title,
    description,
    path: '/privacy-policy',
    locale,
  });
};

export const viewport = viewportGenerator();

const PrivacyPolicyPage: NextPage = () => {
  const content = {
    title: t('legal:privacy.title'),
    updatedAt: t('legal:privacy.updatedAt'),
    description: t('legal:privacy.description'),
    sections: Array.from({ length: 7 }, (_, index) => ({
      title: t(`legal:privacy.sections.${index}.title`),
      body: t(`legal:privacy.sections.${index}.body`),
    })),
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="mx-auto flex w-full max-w-(--breakpoint-lg) flex-1 flex-col gap-8 px-8 py-10 max-sm:px-4">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">{content.title}</h1>
          <p className="text-sm text-slate-500">{content.updatedAt}</p>
          <p className="text-sm leading-relaxed text-slate-700">{content.description}</p>
        </header>

        <section className="space-y-5">
          {content.sections.map((section) => (
            <article key={section.title} className="space-y-2 rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
              <p className="text-sm leading-relaxed text-slate-700">{section.body}</p>
            </article>
          ))}
        </section>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
          <Link href={t('link', { href: '/' })} className="underline underline-offset-2 hover:text-slate-900">
            {t('legal:back-to-top')}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default wrapPage(PrivacyPolicyPage);
