import { IconList } from '@tabler/icons-react';
import type { NextPage } from 'next';

import { PageDescriptionContainer, PageDescriptionText } from '@/app/(app)/_components/PageDescription';
import { PageTitle } from '@/app/(app)/_components/PageTitle';
import { AnalysisListContainer } from '@/app/(app)/analyze-logs/list/_components/AnalysisListContainer';
import { type MetadataGenerator, metadataHelper, viewportGenerator } from '@/shared/lib/metadataGenerator';

export const generateMetadata: MetadataGenerator = async () => {
  const title = '解析一覧';
  const description = '自分が保存したログや他の人が公開しているログを確認できます。';

  return metadataHelper({
    title,
    description,
    path: '/analyze-logs/list',
    noIndex: true,
    noFollow: true,
  });
};

export const viewport = viewportGenerator();

const AnalysisListPage: NextPage = async () => {
  return (
    <div className="space-y-12">
      <div>
        <PageTitle icon={IconList}>解析一覧</PageTitle>
        <PageDescriptionContainer>
          <PageDescriptionText>自分が保存したログや他の人が公開しているログを確認できます。</PageDescriptionText>
        </PageDescriptionContainer>
      </div>

      <AnalysisListContainer />
    </div>
  );
};

export default AnalysisListPage;
