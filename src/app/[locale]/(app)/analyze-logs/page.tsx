import { IconChevronsRight, IconTimeline } from '@tabler/icons-react';
import { t } from 'i18next';
import type { Metadata, NextPage } from 'next';
import { CharacterSelect } from './_components/CharacterSelect';
import { DiceLogList } from './_components/DiceLogList';
import { LogAnalysisCharts } from './_components/LogAnalysisCharts';
import { LogAnalysisStats } from './_components/LogAnalysisStats';
import { UploadLogFileButton } from './_components/UploadLogFileButton';
import {
  PageDescriptionContainer,
  PageDescriptionText,
} from '@/app/[locale]/(app)/_components/PageDescription';
import { PageTitle } from '@/app/[locale]/(app)/_components/PageTitle';
import { metadataGenerator } from '@/shared/lib/metadataGenerator';

type props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const ogpImageRegex = new RegExp(
  `^https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/.+.png`,
);

export const generateMetadata = async (props0: props): Promise<Metadata> => {
  const searchParams = await props0.searchParams;
  const title = 'ログ解析';
  const description =
    'ココフォリアから出力されたログを解析して、ダイスの出目を抽出・分析します。 (クトゥルフ神話TRPG・新クトゥルフ神話TRPGのみ対応)';
  const ogp =
    typeof searchParams.ogp === 'string' && ogpImageRegex.test(searchParams.ogp)
      ? searchParams.ogp
      : undefined;

  const metadata = metadataGenerator({
    title,
    description,
    ogp,
  });

  return metadata;
};

const AnalyzeLogsPage: NextPage = () => (
  <div className="space-y-12">
    <div>
      <PageTitle icon={IconTimeline}>
        {t('common:analyze-logs.title')}
      </PageTitle>
      <PageDescriptionContainer>
        <PageDescriptionText>{t('analyze-logs:usage1')}</PageDescriptionText>
        <PageDescriptionText>{t('analyze-logs:usage2')}</PageDescriptionText>
      </PageDescriptionContainer>
    </div>

    <div className="space-y-4">
      <UploadLogFileButton />
      <CharacterSelect />
    </div>

    <div className="grid place-content-center">
      <IconChevronsRight className="rotate-90" size="64" />
    </div>

    <div className="space-y-4">
      <LogAnalysisStats />
      <LogAnalysisCharts />
    </div>

    <DiceLogList />
  </div>
);

export default AnalyzeLogsPage;
