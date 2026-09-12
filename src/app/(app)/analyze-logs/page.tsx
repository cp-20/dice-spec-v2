import { IconChevronsRight, IconTimeline } from '@tabler/icons-react';
import type { NextPage } from 'next';

import { PageDescriptionContainer, PageDescriptionText } from '@/app/(app)/_components/PageDescription';
import { PageTitle } from '@/app/(app)/_components/PageTitle';
import { mixedEnv } from '@/shared/lib/env';
import { SHARED_IMAGE_SCOPES, storagePaths } from '@/shared/lib/firebase/storage/paths';
import { type MetadataGenerator, metadataHelper, viewportGenerator } from '@/shared/lib/metadataGenerator';

import { AnalyzeLogsErrorAlert } from './_components/AnalyzeLogsErrorAlert';
import { CharacterSelect } from './_components/CharacterSelect';
import {
  DeferredAnalysisSavePanel,
  DeferredDiceLogSummary,
  DeferredLogAnalysisShareButton,
} from './_components/DeferredAnalysisSections';
import { DiceLogList } from './_components/DiceLogList';
import { GameSystemSelect } from './_components/GameSystemSelect';
import { LogAnalysisCharts } from './_components/LogAnalysisCharts';
import { LogAnalysisGuide } from './_components/LogAnalysisGuide';
import { LogAnalysisRankingChart } from './_components/LogAnalysisRankingChart';
import { LogAnalysisStats } from './_components/LogAnalysisStats';
import { LogTabSelect } from './_components/LogTabSelect';
import { decodeOgImageId } from './_components/og';
import { UploadLogFileButton } from './_components/UploadLogFileButton';

// @opennextjs/aws のバグによって `%2F` のエンコーディングが勝手に `/` に変換されるので、`/` を含むパスだと上手く行かない
// ので、id だけをエンコードすることで回避する (その方がURLも短くなる)
// ref: https://github.com/opennextjs/opennextjs-aws/issues/1133
const getOgImageUrl = (ogp: string | string[] | undefined) => {
  if (typeof ogp !== 'string') return undefined;

  const legacyOgImageRegex = new RegExp(
    `^https://firebasestorage.googleapis.com/v0/b/${mixedEnv.firebaseStorageBucket}/o/.+`,
  );

  if (legacyOgImageRegex.test(ogp)) {
    return ogp;
  }

  const decodedId = decodeOgImageId(ogp);
  if (decodedId !== null) {
    const path = storagePaths.getSharedImagePath(SHARED_IMAGE_SCOPES['analyze-logs'], decodedId);
    return `https://firebasestorage.googleapis.com/v0/b/${mixedEnv.firebaseStorageBucket}/o/${encodeURIComponent(path)}?alt=media`;
  }

  return undefined;
};

export const generateMetadata: MetadataGenerator = async (props) => {
  const searchParams = await props.searchParams;
  const title = 'ココフォリアのログ解析・出目集計';
  const description = 'ココフォリアのログから、キャラクターごとの出目の平均・成功率・グラフを確認できます。';
  const ogp = getOgImageUrl(searchParams.ogp);

  const metadata = metadataHelper({
    title,
    description,
    path: '/analyze-logs',
    ogp,
  });

  return metadata;
};

export const viewport = viewportGenerator();

const AnalyzeLogsPage: NextPage = () => (
  <div className="space-y-12">
    <div>
      <PageTitle icon={IconTimeline}>ココフォリアのログ解析・出目集計</PageTitle>
      <PageDescriptionContainer>
        <PageDescriptionText>
          ココフォリアのログから、キャラクターごとの出目の平均・成功率・グラフを確認できます。
        </PageDescriptionText>
        <LogAnalysisGuide />
      </PageDescriptionContainer>
    </div>

    <div className="space-y-4 @container">
      <UploadLogFileButton />
      <LogTabSelect />
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
      <DeferredLogAnalysisShareButton />
      <DeferredAnalysisSavePanel />
      <LogAnalysisCharts />
    </div>

    <DeferredDiceLogSummary />

    <DiceLogList />
  </div>
);

export default AnalyzeLogsPage;
