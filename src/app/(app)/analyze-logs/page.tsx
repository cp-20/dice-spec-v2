import {
  IconChartBar,
  IconChevronsRight,
  IconTimeline,
} from '@tabler/icons-react';
import type { NextPage } from 'next';
import { CharacterSelect } from './_components/CharacterSelect';
import { DiceLogList } from './_components/DiceLogList';
import { LogAnalysisStats } from './_components/LogAnalysisStats';
import { ShareResultButton } from './_components/ShareResultButton';
import { UploadLogFileButton } from './_components/UploadLogFileButton';
import {
  PageDescriptionContainer,
  PageDescriptionText,
} from '@/app/(app)/_components/PageDescription';
import { PageTitle } from '@/app/(app)/_components/PageTitle';

const AnalyzeLogsPage: NextPage = () => (
  <div className="space-y-12">
    <div>
      <PageTitle icon={IconTimeline}>ログ解析</PageTitle>
      <PageDescriptionContainer>
        <PageDescriptionText>
          ココフォリアから出力されたログを解析して、ダイスの出目を抽出・分析します。
        </PageDescriptionText>
        <PageDescriptionText>
          (クトゥルフ神話TRPG・新クトゥルフ神話TRPGのみ対応)
        </PageDescriptionText>
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
      <ShareResultButton />

      <div className="flex gap-4">
        <div className="flex flex-1 items-center justify-center gap-2 rounded-md border p-8">
          <IconChartBar />
          <span>ここにグラフ</span>
        </div>
        <div className="flex flex-1 items-center justify-center gap-2 rounded-md border p-8">
          <IconChartBar />
          <span>ここにグラフ</span>
        </div>
      </div>
    </div>

    <DiceLogList />
  </div>
);

export default AnalyzeLogsPage;
