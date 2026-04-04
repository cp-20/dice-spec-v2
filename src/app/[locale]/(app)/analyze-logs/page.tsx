import { IconChevronsRight, IconTimeline } from '@tabler/icons-react';
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
import { mixedEnv } from '@/shared/lib/env';
import { AnalysisSavePanel } from './_components/AnalysisSavePanel';
import { AnalyzeLogsErrorAlert } from './_components/AnalyzeLogsErrorAlert';
import { CharacterSelect } from './_components/CharacterSelect';
import { DiceLogList } from './_components/DiceLogList';
import { DiceLogSummary } from './_components/DiceLogSummary';
import { GameSystemSelect } from './_components/GameSystemSelect';
import { LogAnalysisCharts } from './_components/LogAnalysisCharts';
import { LogAnalysisRankingChart } from './_components/LogAnalysisRankingChart';
import { LogAnalysisShareButton } from './_components/LogAnalysisShareButton';
import { LogAnalysisStats } from './_components/LogAnalysisStats';
import { UploadLogFileButton } from './_components/UploadLogFileButton';

export const generateMetadata: MetadataGenerator = async (props) => {
  const ogpImageRegex = new RegExp(
    `^https://firebasestorage.googleapis.com/v0/b/${mixedEnv.firebaseStorageBucket}/o/.+.png`,
  );

  const searchParams = await props.searchParams;
  const title = t('common:analyze-logs.title');
  const description = t('analyze-logs:usage1');
  const ogp =
    typeof searchParams.ogp === 'string' && ogpImageRegex.test(searchParams.ogp) ? searchParams.ogp : undefined;

  const locale = await localeHelper(props);

  const metadata = metadataHelper({
    title,
    description,
    path: '/analyze-logs',
    locale,
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

    <div className="space-y-4 @container">
      <UploadLogFileButton />
      <div className="grid grid-cols-2 gap-4 @max-md:grid-cols-1">
        <GameSystemSelect />
        <CharacterSelect />
      </div>
    </div>

    <div>
      <AnalyzeLogsErrorAlert />
    </div>

    <div className="grid place-content-center">
      <IconChevronsRight className="rotate-90" size="64" />
    </div>

    <div className="space-y-4">
      <div className="grid grid-cols-2">
        <LogAnalysisStats />
        <LogAnalysisRankingChart />
      </div>
      <LogAnalysisShareButton />
      <AnalysisSavePanel />
      <LogAnalysisCharts />
    </div>

    <DiceLogSummary />

    <DiceLogList />

    <div className="my-16">
      <BlogCallout />
    </div>
  </div>
);

export default wrapPage(AnalyzeLogsPage);
