import { IconList } from '@tabler/icons-react';
import { t } from 'i18next';
import type { NextPage } from 'next';
import { PageDescriptionContainer, PageDescriptionText } from '@/app/[locale]/(app)/_components/PageDescription';
import { PageTitle } from '@/app/[locale]/(app)/_components/PageTitle';
import { AnalysisListContainer } from '@/app/[locale]/(app)/analyze-logs/list/_components/AnalysisListContainer';
import {
  localeHelper,
  type MetadataGenerator,
  metadataHelper,
  viewportGenerator,
} from '@/shared/lib/metadataGenerator';
import { wrapPage } from '@/shared/i18n/page-layout';

export const generateMetadata: MetadataGenerator = async (props) => {
  const title = t('common:analysis-list.title');
  const description = t('common:analysis-list.description');

  const locale = await localeHelper(props);

  return metadataHelper({
    title,
    description,
    path: '/analyze-logs/list',
    locale,
    noIndex: true,
    noFollow: true,
  });
};

export const viewport = viewportGenerator();

const AnalysisListPage: NextPage = async () => {
  return (
    <div className="space-y-12">
      <div>
        <PageTitle icon={IconList}>{t('common:analysis-list.title')}</PageTitle>
        <PageDescriptionContainer>
          <PageDescriptionText>{t('common:analysis-list.description')}</PageDescriptionText>
        </PageDescriptionContainer>
      </div>

      <AnalysisListContainer />
    </div>
  );
};

export default wrapPage(AnalysisListPage);
