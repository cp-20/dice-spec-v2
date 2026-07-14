import { IconDice5 } from '@tabler/icons-react';
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

import { DiceRollModeTabs } from './_components/DiceRollModeTabs';
import { SimpleDiceInput } from './_components/SimpleDiceInput';
import { SimpleDiceOutput } from './_components/SimpleDiceOutput';
import { SimpleDiceQuickInput } from './_components/SimpleDiceQuickInput';

export const generateMetadata: MetadataGenerator = async (props) => {
  const locale = await localeHelper(props);
  return metadataHelper({
    title: t('common:dice.title'),
    description: t('common:dice.description'),
    path: '/dice',
    locale,
  });
};

export const viewport = viewportGenerator();

const DicePage: NextPage = async () => {
  return (
    <div className="space-y-12">
      <div>
        <PageTitle icon={IconDice5}>{t('common:dice.title')}</PageTitle>
        <PageDescriptionContainer>
          <PageDescriptionText>{t('dice:usage')}</PageDescriptionText>
        </PageDescriptionContainer>
      </div>

      <DiceRollModeTabs
        simpleTabContent={
          <div className="space-y-12">
            <SimpleDiceOutput />
            <SimpleDiceQuickInput />
            <SimpleDiceInput />
          </div>
        }
      />
      <div className="my-16">
        <BlogCallout />
      </div>
    </div>
  );
};

export default wrapPage(DicePage);
