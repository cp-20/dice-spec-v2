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
import { CharacterSelect } from './_components/CharacterSelect';
import { DiceLogList } from './_components/DiceLogList';
import { GameSystemSelect } from './_components/GameSystemSelect';
import { LogAnalysisCharts } from './_components/LogAnalysisCharts';
import { LogAnalysisRankingChart } from './_components/LogAnalysisRankingChart';
import { LogAnalysisStats } from './_components/LogAnalysisStats';
import { UploadLogFileButton } from './_components/UploadLogFileButton';

const ogpImageRegex = new RegExp(
  `^https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/.+.png`,
);

export const generateMetadata: MetadataGenerator = async (props) => {
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

    <div className="grid place-content-center">
      <IconChevronsRight className="rotate-90" size="64" />
    </div>

    <div className="space-y-4">
      <div className="grid grid-cols-2">
        <LogAnalysisStats />
        <LogAnalysisRankingChart />
      </div>
      <LogAnalysisCharts />
    </div>

    <div className="my-16">
      <BlogCallout />
    </div>

    <DiceLogList />
  </div>
);

export default wrapPage(AnalyzeLogsPage);
