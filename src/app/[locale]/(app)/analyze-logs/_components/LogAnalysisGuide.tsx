import { t } from 'i18next';
import Link from 'next/link';

export const LogAnalysisGuide = () => (
  <details className="text-sm">
    <summary className="cursor-pointer font-medium">{t('analyze-logs:guide.title')}</summary>
    <div className="mt-4 space-y-4 text-sm">
      <ol className="list-decimal space-y-2 pl-6">
        <li>{t('analyze-logs:guide.step1')}</li>
        <li>{t('analyze-logs:guide.step2')}</li>
        <li>{t('analyze-logs:guide.step3')}</li>
      </ol>
      <div className="space-y-3">
        <h3 className="font-medium">{t('analyze-logs:guide.systems-title')}</h3>
        <p>{t('analyze-logs:guide.systems')}</p>
      </div>
      <div className="space-y-3">
        <p>{t('analyze-logs:guide.interpretation')}</p>
        <Link href={t('translation:link', { href: '/expect' })} className="underline underline-offset-4">
          {t('analyze-logs:guide.prediction')}
        </Link>
      </div>
    </div>
  </details>
);
