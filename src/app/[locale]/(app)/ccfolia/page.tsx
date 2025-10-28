import { IconChevronsRight, IconFileExport } from '@tabler/icons-react';
import { t } from 'i18next';
import type { NextPage } from 'next';
import { BlogCallout } from '@/app/[locale]/(app)/_components/BlogCallout';
import { PageDescriptionContainer, PageDescriptionText } from '@/app/[locale]/(app)/_components/PageDescription';
import { PageTitle } from '@/app/[locale]/(app)/_components/PageTitle';
import { wrapPage } from '@/shared/i18n/page-layout';
import {
  localeHelper,
  type MetadataGenerator,
  metadataHelper,
  viewportGenerator,
} from '@/shared/lib/metadataGenerator';
import { InputForm } from './_components/InputForm';
import { LoadClipboardButton } from './_components/LoadClipboardButton';
import { ResultView } from './_components/ResultView';

export const generateMetadata: MetadataGenerator = async (props) => {
  const locale = await localeHelper(props);
  return metadataHelper({
    title: t('common:ccfolia.title'),
    description: t('ccfolia:usage'),
    path: '/ccfolia',
    locale,
  });
};

export const viewport = viewportGenerator();

const CcfoliaPage: NextPage = () => (
  <>
    <div className="space-y-12">
      <div>
        <PageTitle icon={IconFileExport}>{t('common:ccfolia.title')}</PageTitle>
        <PageDescriptionContainer>
          <PageDescriptionText>{t('ccfolia:usage')}</PageDescriptionText>
        </PageDescriptionContainer>
      </div>

      <LoadClipboardButton />

      <InputForm />

      <div className="grid place-content-center">
        <IconChevronsRight className="rotate-90" size="64" />
      </div>

      <ResultView />

      <div className="my-16">
        <BlogCallout />
      </div>
    </div>
  </>
);

export default wrapPage(CcfoliaPage);
