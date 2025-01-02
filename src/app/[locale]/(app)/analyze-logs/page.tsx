import { IconChevronsRight, IconTimeline } from '@tabler/icons-react';
import { t } from 'i18next';
import type { Metadata, NextPage } from 'next';
import { CharacterSelect } from './_components/CharacterSelect';
import { DiceLogList } from './_components/DiceLogList';
import { LogAnalysisCharts } from './_components/LogAnalysisCharts';
import { LogAnalysisStats } from './_components/LogAnalysisStats';
import { UploadLogFileButton } from './_components/UploadLogFileButton';
import { PageDescriptionContainer, PageDescriptionText } from '@/app/[locale]/(app)/_components/PageDescription';
import { PageTitle } from '@/app/[locale]/(app)/_components/PageTitle';
import { metadataGenerator, viewportGenerator } from '@/shared/lib/metadataGenerator';
import { GameSystemRequest } from './_components/GameSystemRequest';
import { GameSystemSelect } from './_components/GameSystemSelect';

type props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const ogpImageRegex = new RegExp(
  `^https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/.+.png`,
);

export const generateMetadata = async (props0: props): Promise<Metadata> => {
  const searchParams = await props0.searchParams;
  const title = 'ログ解析';
  const description = 'ココフォリアから出力されたログを解析して、ダイスの出目を抽出・分析します。';
  const ogp =
    typeof searchParams.ogp === 'string' && ogpImageRegex.test(searchParams.ogp) ? searchParams.ogp : undefined;

  const metadata = metadataGenerator({
    title,
    description,
    ogp,
  });

  return metadata;
};

export const viewport = viewportGenerator();

const AnalyzeLogsPage: NextPage = () => (
  <div className="space-y-12">
    <div>
      <PageTitle icon={IconTimeline}>{t('common:analyze-logs.title')}</PageTitle>
      <PageDescriptionContainer>
        <PageDescriptionText>{t('analyze-logs:usage1')}</PageDescriptionText>
      </PageDescriptionContainer>
    </div>

    <div className="space-y-4">
      <GameSystemRequest />
      <UploadLogFileButton />
      <GameSystemSelect />
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
