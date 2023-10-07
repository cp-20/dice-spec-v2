import { IconDice5 } from '@tabler/icons-react';
import type { NextPage } from 'next';
import { AdvancedSettings } from './_components/AdvancedSettings';
import { DiceCommandInput } from './_components/DiceCommandInput';
import { DiceOutput } from './_components/DiceOutput';
import { GameSystemSelect } from './_components/GameSystemSelect';
import { QuickInput } from './_components/QuickInput';
import {
  PageDescriptionContainer,
  PageDescriptionText,
} from '@/app/(app)/_components/PageDescription';
import { PageTitle } from '@/app/(app)/_components/PageTitle';
import { DiceBotHelp } from '@/app/(app)/dice/_components/DiceBotDescription';
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
      <Toaster />
    </>
  );
};

export default DicePage;
