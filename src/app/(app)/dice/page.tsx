import { IconDice5 } from '@tabler/icons-react';
import type { NextPage } from 'next';

import { PageDescriptionContainer, PageDescriptionText } from '@/app/(app)/_components/PageDescription';
import { PageTitle } from '@/app/(app)/_components/PageTitle';
import { type MetadataGenerator, metadataHelper, viewportGenerator } from '@/shared/lib/metadataGenerator';

import { DiceRollModeTabs } from './_components/DiceRollModeTabs';
import { SimpleDiceInput } from './_components/SimpleDiceInput';
import { SimpleDiceOutput } from './_components/SimpleDiceOutput';
import { SimpleDiceQuickInput } from './_components/SimpleDiceQuickInput';

export const generateMetadata: MetadataGenerator = async () => {
  return metadataHelper({
    title: 'ダイスロール',
    description:
      '1D6、2D6、3D6、1D100、2D10、2D3 といったダイスはもちろん、どんな複雑なダイスでも振ることができます！クトルゥフ神話TRPGやシノビガミといったゲームシステム特有のダイスにも対応しています！',
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
    </div>
  );
};

export default DicePage;
