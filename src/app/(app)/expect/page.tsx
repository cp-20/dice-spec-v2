import { IconSearch } from '@tabler/icons-react';
import type { NextPage } from 'next';
import { Fragment } from 'react';

import { PageDescriptionContainer, PageDescriptionText } from '@/app/(app)/_components/PageDescription';
import { PageTitle } from '@/app/(app)/_components/PageTitle';
import { InlineCommand } from '@/app/(app)/expect/_components/InlineCommand';
import { type MetadataGenerator, metadataHelper, viewportGenerator } from '@/shared/lib/metadataGenerator';

import { DiceCommandInput } from './_components/DiceCommandInput';
import { ExpectationGuide } from './_components/ExpectationGuide';
import { ExpectResultDistributionChart } from './_components/ExpectResultDistributionChart';
import { ExpectResultStats } from './_components/ExpectResultStats';
import { SystemSpecificExpectations } from './_components/SystemSpecificExpectations';

const inlineCommandRegex = /`((?:[^`]|\\`)+)`/g;

const insertInlineCommand = (value: string) => {
  const result = [];

  let match = null;
  let index = 0;
  let key = 0;
  // biome-ignore lint/suspicious/noAssignInExpressions: hack
  while ((match = inlineCommandRegex.exec(value)) !== null) {
    const [inlineCommand] = match;
    result.push(<Fragment key={key++}>{value.slice(index, match.index)}</Fragment>);
    result.push(<InlineCommand key={key++}>{inlineCommand.slice(1, -1)}</InlineCommand>);
    index = match.index + inlineCommand.length;
  }

  result.push(<Fragment key={key++}>{value.slice(index)}</Fragment>);

  return result;
};

export const generateMetadata: MetadataGenerator = async () => {
  return metadataHelper({
    title: 'ダイス期待値・確率計算 | 3D6・1D100の期待値と成功率',
    description:
      '3D6・2D6・1D100などダイスの期待値と確率分布を計算する無料ツールです。1D100<=50や2D6>=10の成功率、クトゥルフ神話TRPGの対抗ロールの勝率も確認できます。',
    path: '/expect',
  });
};

export const viewport = viewportGenerator();

const ExpectPage: NextPage = () => (
  <div className="space-y-12">
    <div>
      <PageTitle icon={IconSearch}>ダイス予測</PageTitle>
      <PageDescriptionContainer>
        <PageDescriptionText key="0">
          {insertInlineCommand(
            '`1d6`や`1D100`といったダイスの期待値を計算することで、ダイスを振るときにどういう結果が出るのかを予測できます。',
          )}
        </PageDescriptionText>
        <PageDescriptionText key="1">
          {insertInlineCommand('さらに`1d100<=10`や`2D6>=10`と入力することで、その確率も知ることができます。')}
        </PageDescriptionText>
      </PageDescriptionContainer>
    </div>

    <DiceCommandInput />

    <ExpectResultStats />

    <ExpectResultDistributionChart />

    <SystemSpecificExpectations />

    <ExpectationGuide />
  </div>
);

export default ExpectPage;
