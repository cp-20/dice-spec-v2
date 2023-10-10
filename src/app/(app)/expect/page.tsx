import { IconSearch } from '@tabler/icons-react';
import type { NextPage } from 'next';
import { DiceCommandInput } from './_components/DiceCommandInput';
import { ExpectResultDistributionChart } from './_components/ExpectResultDistributionChart';
import { ExpectResultStats } from './_components/ExpectResultStats';
import { InlineCommand } from './_components/InlineCommand';
import {
  PageDescriptionContainer,
  PageDescriptionText,
} from '@/app/(app)/_components/PageDescription';
import { PageTitle } from '@/app/(app)/_components/PageTitle';
import { metadataGenerator } from '@/shared/lib/metadataGenerator';

export const metadata = metadataGenerator({
  title: 'ダイス予測',
  description:
    '1d6や1D100といったダイスの期待値を計算することで、ダイスを振るときにどういう結果が出るのかを予測できます。さらに1d100<=10や2D6>=10と入力することで、その確率も知ることができます。',
});

const ExpectPage: NextPage = () => (
  <div className="space-y-12">
    <div>
      <PageTitle icon={IconSearch}>ダイス予測</PageTitle>
      <PageDescriptionContainer>
        <PageDescriptionText>
          <InlineCommand>1d6</InlineCommand>や
          <InlineCommand>1D100</InlineCommand>
          といったダイスの期待値などを計算することで、ダイスを振るときにどういう結果が出るのかを予測できます。
        </PageDescriptionText>
        <PageDescriptionText>
          さらに
          <InlineCommand>{'1d100<=10'}</InlineCommand>や
          <InlineCommand>{'2D6>=10'}</InlineCommand>
          と入力することで、その確率も知ることができます。
        </PageDescriptionText>
      </PageDescriptionContainer>
    </div>

    <DiceCommandInput />

    <ExpectResultStats />

    <ExpectResultDistributionChart />
  </div>
);

export default ExpectPage;
