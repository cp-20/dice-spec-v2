import { t } from 'i18next';
import Link from 'next/link';

export const LogAnalysisGuide = () => (
  <section className="space-y-6" aria-labelledby="log-analysis-guide-title">
    <h2 id="log-analysis-guide-title" className="text-2xl font-bold">
      {t('analyze-logs:guide.title')}
    </h2>
    <ol className="list-decimal space-y-2 pl-6">
      <li>{t('analyze-logs:guide.step1')}</li>
      <li>{t('analyze-logs:guide.step2')}</li>
      <li>{t('analyze-logs:guide.step3')}</li>
    </ol>
    <div className="space-y-3">
      <h3 className="text-xl font-bold">{t('analyze-logs:guide.systems-title')}</h3>
      <p>{t('analyze-logs:guide.systems')}</p>
    </div>
    <div className="space-y-3">
      <h3 className="text-xl font-bold">{t('analyze-logs:guide.example-title')}</h3>
      <p>{t('analyze-logs:guide.example')}</p>
      <p>{t('analyze-logs:guide.interpretation')}</p>
      <Link href={t('translation:link', { href: '/expect' })} className="underline underline-offset-4">
        {t('analyze-logs:guide.prediction')}
      </Link>
    </div>
  </section>
);
