import { IconSearch } from '@tabler/icons-react';
import { t } from 'i18next';
import type { NextPage } from 'next';
import { Fragment } from 'react';
import { BlogCallout } from '@/app/[locale]/(app)/_components/BlogCallout';
import { PageDescriptionContainer, PageDescriptionText } from '@/app/[locale]/(app)/_components/PageDescription';
import { PageTitle } from '@/app/[locale]/(app)/_components/PageTitle';
import { InlineCommand } from '@/app/[locale]/(app)/expect/_components/InlineCommand';
import { wrapPage } from '@/shared/i18n/page-layout';
import {
  localeHelper,
  type MetadataGenerator,
  metadataHelper,
  viewportGenerator,
} from '@/shared/lib/metadataGenerator';
import { DiceCommandInput } from './_components/DiceCommandInput';
import { ExpectResultDistributionChart } from './_components/ExpectResultDistributionChart';
import { ExpectResultStats } from './_components/ExpectResultStats';

const inlineCommandRegex = /`((?:[^`]|\\`)+)`/g;

const stripInlineCommand = (value: string) => value.replaceAll(inlineCommandRegex, '$1');

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

export const generateMetadata: MetadataGenerator = async (props) => {
  const locale = await localeHelper(props);
  return metadataHelper({
    title: t('common:expect.title'),
    description: stripInlineCommand(`${t('expect:usage1')} ${t('expect:usage2')}`),
    locale,
  });
};

export const viewport = viewportGenerator();

const ExpectPage: NextPage = () => (
  <div className="space-y-12">
    <div>
      <PageTitle icon={IconSearch}>{t('common:expect.title')}</PageTitle>
      <PageDescriptionContainer>
        <PageDescriptionText key="0">{insertInlineCommand(t('expect:usage1'))}</PageDescriptionText>
        <PageDescriptionText key="1">{insertInlineCommand(t('expect:usage2'))}</PageDescriptionText>
      </PageDescriptionContainer>
    </div>

    <DiceCommandInput />

    <ExpectResultStats />

    <ExpectResultDistributionChart />

    <div className="my-16">
      <BlogCallout />
    </div>
  </div>
);

export default wrapPage(ExpectPage);
