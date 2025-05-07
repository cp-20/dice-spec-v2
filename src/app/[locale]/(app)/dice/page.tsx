import { IconDice5 } from '@tabler/icons-react';
import { t } from 'i18next';
import type { NextPage } from 'next';
import { AdvancedSettings } from './_components/AdvancedSettings';
import { DiceBotHelp } from './_components/DiceBotDescription';
import { DiceCommandInput } from './_components/DiceCommandInput';
import { DiceOutput } from './_components/DiceOutput';
import { DiceRollModeTabs } from './_components/DiceRollModeTabs';
import { GameSystemSelect } from './_components/GameSystemSelect';
import { QuickInput } from './_components/QuickInput';
import { SimpleDiceInput } from './_components/SimpleDiceInput';
import { SimpleDiceOutput } from './_components/SimpleDiceOutput';
import { SimpleDiceQuickInput } from './_components/SimpleDiceQuickInput';
import { PageDescriptionContainer, PageDescriptionText } from '@/app/[locale]/(app)/_components/PageDescription';
import { PageTitle } from '@/app/[locale]/(app)/_components/PageTitle';
import { Toaster } from '@/shared/components/ui/toaster';
import {
  localeHelper,
  type MetadataGenerator,
  metadataHelper,
  viewportGenerator,
} from '@/shared/lib/metadataGenerator';
import { wrapPage } from '@/shared/i18n/page-layout';

export const generateMetadata: MetadataGenerator = async (props) => {
  const locale = await localeHelper(props);
  return metadataHelper({
    title: t('common:dice.title'),
    description: t('common:dice.description'),
    locale,
  });
};

export const viewport = viewportGenerator();

const DicePage: NextPage = async () => {
  return (
    <>
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
          advancedTabContent={
            <div className="space-y-12">
              <div className="space-y-4">
                <div>
                  <div className="mb-2 text-sm font-bold">{t('dice:advanced.game-system.label')}</div>
                  <GameSystemSelect />
                </div>

                <DiceOutput />

                <QuickInput />

                <DiceCommandInput />
              </div>
              <DiceBotHelp />
              <AdvancedSettings />
            </div>
          }
        />
      </div>
      <Toaster />
    </>
  );
};

export default wrapPage(DicePage);
