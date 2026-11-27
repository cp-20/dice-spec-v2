import { IconDice5 } from '@tabler/icons-react';
import type { NextPage } from 'next';

import { PageDescriptionContainer, PageDescriptionText } from '@/app/(app)/_components/PageDescription';
import { PageTitle } from '@/app/(app)/_components/PageTitle';
import { type MetadataGenerator, metadataHelper, viewportGenerator } from '@/shared/lib/metadataGenerator';

import { DiceRollGuide } from './_components/DiceRollGuide';
import { DiceRollModeTabs } from './_components/DiceRollModeTabs';
import { SimpleDiceInput } from './_components/SimpleDiceInput';
import { SimpleDiceOutput } from './_components/SimpleDiceOutput';
import { SimpleDiceQuickInput } from './_components/SimpleDiceQuickInput';

export const generateMetadata: MetadataGenerator = async () => {
  return metadataHelper({
    title: 'ダイスロール | 1D100・1D6・2D6をすぐ振れるTRPGダイス',
    description:
      '1D100・1D6・2D6・3D6などのダイスをブラウザですぐ振れる無料のダイスロールツールです。BCDiceに対応し、クトゥルフ神話TRPGやシノビガミなどゲームシステム特有の判定も振れます。',
    path: '/dice',
  });
};

export const viewport = viewportGenerator();

const DicePage: NextPage = async () => {
  return (
    <div className="space-y-12">
      <div>
        <PageTitle icon={IconDice5}>ダイスロール</PageTitle>
        <PageDescriptionContainer>
          <PageDescriptionText>
            シンプルモードでは基本的なダイスを、アドバンスドモードでは様々なゲームシステムのダイスを振ることができます。
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
      />

      <DiceRollGuide />
    </div>
  );
};

export default DicePage;
