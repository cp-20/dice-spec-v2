import { IconSearch } from '@tabler/icons-react';
import { t } from 'i18next';
import type { NextPage } from 'next';
import { DiceCommandInput } from './_components/DiceCommandInput';
import { ExpectResultDistributionChart } from './_components/ExpectResultDistributionChart';
import { ExpectResultStats } from './_components/ExpectResultStats';
import {
  PageDescriptionContainer,
  PageDescriptionText,
} from '@/app/[locale]/(app)/_components/PageDescription';
import { PageTitle } from '@/app/[locale]/(app)/_components/PageTitle';
import { InlineCommand } from '@/app/[locale]/(app)/expect/_components/InlineCommand';
import { metadataGenerator } from '@/shared/lib/metadataGenerator';

export const metadata = metadataGenerator({
  title: 'ダイス予測',
  description:
    '1d6や1D100といったダイスの期待値を計算することで、ダイスを振るときにどういう結果が出るのかを予測できます。さらに1d100<=10や2D6>=10と入力することで、その確率も知ることができます。',
});

const inlineCommandRegex = /`([^`]|\\`)+`/g;

const insertInlineCommand = (value: string) => {
  const result = [];

  let match = null;
  let index = 0;
  while ((match = inlineCommandRegex.exec(value)) !== null) {
    const [inlineCommand] = match;
    result.push(value.slice(index, match.index));
    result.push(<InlineCommand>{inlineCommand.slice(1, -1)}</InlineCommand>);
    index = match.index + inlineCommand.length;
  }

  result.push(value.slice(index));

  return result;
};

const ExpectPage: NextPage = () => (
  <div className="space-y-12">
    <div>
      <PageTitle icon={IconSearch}>{t('common:expect.title')}</PageTitle>
      <PageDescriptionContainer>
        <PageDescriptionText>
          {insertInlineCommand(t('expect:usage1'))}
        </PageDescriptionText>
        <PageDescriptionText>
          {insertInlineCommand(t('expect:usage2'))}
        </PageDescriptionText>
      </PageDescriptionContainer>
    </div>

    <DiceCommandInput />

    <ExpectResultStats />

    <ExpectResultDistributionChart />
  </div>
);

export default ExpectPage;
