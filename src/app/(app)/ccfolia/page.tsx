import { IconChevronsRight, IconFileExport } from '@tabler/icons-react';
import type { NextPage } from 'next';
import { InputForm } from './_components/InputForm';
import { LoadClipboardButton } from './_components/LoadClipboardButton';
import { ResultView } from './_components/ResultView';
import {
  PageDescriptionContainer,
  PageDescriptionText,
} from '@/app/(app)/_components/PageDescription';
import { PageTitle } from '@/app/(app)/_components/PageTitle';
import { Toaster } from '@/shared/components/ui/toaster';
import { metadataGenerator } from '@/shared/lib/metadataGenerator';

export const metadata = metadataGenerator({
  title: 'ココフォリア出力',
  description:
    'キャラの各項目を記入すると、ココフォリアに出力できる形式にフォーマットしてくれるツールです。逆にココフォリア出力形式から読み込むこともできるので、「ここの値を少しだけ変えたい！」といった場合に便利です。',
});

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

      <LoadClipboardButton />

      <InputForm />

      <div className="grid place-content-center">
        <IconChevronsRight className="rotate-90" size="64" />
      </div>

      <ResultView />
    </div>

    <Toaster />
  </>
);

export default CcfoliaPage;
