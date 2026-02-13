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
  const title = t('legal:commerce.metadata.title');
  const description = t('legal:commerce.metadata.description');

  return metadataHelper({
    title,
    description,
    path: '/specified-commercial-transactions',
    locale,
  });
};

export const viewport = viewportGenerator();

const SpecifiedCommercialTransactionsPage: NextPage = () => {
  const content = {
    title: t('legal:commerce.title'),
    updatedAt: t('legal:commerce.updatedAt'),
    rows: Array.from({ length: 11 }, (_, index) => ({
      label: t(`legal:commerce.rows.${index}.label`),
      value: t(`legal:commerce.rows.${index}.value`),
    })),
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="mx-auto flex w-full max-w-(--breakpoint-lg) flex-1 flex-col gap-8 px-8 py-10 max-sm:px-4">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">{content.title}</h1>
          <p className="text-sm text-slate-500">{content.updatedAt}</p>
        </header>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <dl className="divide-y divide-slate-200">
            {content.rows.map((row) => (
              <div key={row.label} className="grid gap-2 p-4 md:grid-cols-[280px_1fr]">
                <dt className="text-sm font-semibold text-slate-900">{row.label}</dt>
                <dd className="text-sm leading-relaxed text-slate-700">{row.value}</dd>
              </div>
            ))}
          </dl>
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

export default wrapPage(SpecifiedCommercialTransactionsPage);
