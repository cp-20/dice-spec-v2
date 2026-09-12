import { IconFileExport } from '@tabler/icons-react';
import type { NextPage } from 'next';

import { PageDescriptionContainer, PageDescriptionText } from '@/app/(app)/_components/PageDescription';
import { PageTitle } from '@/app/(app)/_components/PageTitle';
import { type MetadataGenerator, metadataHelper, viewportGenerator } from '@/shared/lib/metadataGenerator';

import { CcfoliaEditor } from './_components/ccfolia-editor/CcfoliaEditor';

export const generateMetadata: MetadataGenerator = async () => {
  return metadataHelper({
    title: 'ココフォリア出力',
    description:
      'キャラの各項目を記入すると、ココフォリアに出力できる形式にフォーマットしてくれるツールです。逆にココフォリア出力形式から読み込むこともできるので、「ここの値を少しだけ変えたい！」といった場合に便利です。',
    path: '/ccfolia',
  });
};

export const viewport = viewportGenerator();

const CcfoliaPage: NextPage = () => (
  <>
    <div className="space-y-12">
      <div>
        <PageTitle icon={IconFileExport}>ココフォリア出力</PageTitle>
        <PageDescriptionContainer>
          <PageDescriptionText>
            キャラの各項目を記入すると、ココフォリアに出力できる形式にフォーマットしてくれるツールです。逆にココフォリア出力形式から読み込むこともできるので、「ここの値を少しだけ変えたい！」といった場合に便利です。
          </PageDescriptionText>
        </PageDescriptionContainer>
      </div>

      <CcfoliaEditor />
    </div>
  </>
);

export default CcfoliaPage;
