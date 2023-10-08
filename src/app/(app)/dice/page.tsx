import { IconDice5 } from '@tabler/icons-react';
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
import {
  PageDescriptionContainer,
  PageDescriptionText,
} from '@/app/(app)/_components/PageDescription';
import { PageTitle } from '@/app/(app)/_components/PageTitle';
import { Toaster } from '@/shared/components/ui/toaster';

const DicePage: NextPage = async () => {
  return (
    <>
      <div className="space-y-12">
        <div>
          <PageTitle icon={IconDice5}>ダイスロール</PageTitle>
          <PageDescriptionContainer>
            <PageDescriptionText>
              好きなダイスを振ることができます。BCDiceを使っているため、ココフォリアなどのセッションツールと変わらない使い心地で使えます。
            </PageDescriptionText>
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
                  <div className="mb-2 text-sm font-bold">ゲームシステム</div>
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

export default DicePage;
