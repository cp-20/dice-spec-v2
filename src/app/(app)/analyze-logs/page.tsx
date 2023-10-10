import { IconChevronsRight, IconTimeline } from '@tabler/icons-react';
import type { Metadata, NextPage } from 'next';
import { CharacterSelect } from './_components/CharacterSelect';
import { DiceLogList } from './_components/DiceLogList';
import { LogAnalysisCharts } from './_components/LogAnalysisCharts';
import { LogAnalysisStats } from './_components/LogAnalysisStats';
import { ShareResultButton } from './_components/ShareResultButton';
import { UploadLogFileButton } from './_components/UploadLogFileButton';
import {
  PageDescriptionContainer,
  PageDescriptionText,
} from '@/app/(app)/_components/PageDescription';
import { PageTitle } from '@/app/(app)/_components/PageTitle';
import { metadataGenerator } from '@/shared/lib/metadataGenerator';

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const ogpImageRegex = new RegExp(
  `^https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/.+.png`,
);

export const generateMetadata = ({ searchParams }: props): Metadata => {
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
      <LogAnalysisCharts />
    </div>

    <DiceLogList />
  </div>
);

export default AnalyzeLogsPage;
