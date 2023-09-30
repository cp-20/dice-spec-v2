import { IconDice5 } from '@tabler/icons-react';
import type { NextPage } from 'next';
import { ContainerSection } from '@/app/(app)/_components/ContainerSection';
import {
  PageDescriptionContainer,
  PageDescriptionText,
} from '@/app/(app)/_components/PageDescription';
import { PageTitle } from '@/app/(app)/_components/PageTitle';
import { AdvancedSettings } from '@/app/(app)/dice/_components/AdvancedSettings';
import { DiceOutput } from '@/app/(app)/dice/_components/DiceOutput';
import { GameSystemSelect } from '@/app/(app)/dice/_components/GameSystemSelect';
import { QuickInput } from '@/app/(app)/dice/_components/QuickInput';
import { fetchGameSystemList } from '@/app/(app)/dice/_composable/fetchGameSystemList';
import { RichText } from '@/shared/components/elements/RichText';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

const DicePage: NextPage = async () => {
  const gameSystems = await fetchGameSystemList();

  return (
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
          <GameSystemSelect systems={gameSystems} />
        </div>

        <div>
          <DiceOutput
            logs={new Array(100).fill(0).map((_, i) => ({
              system: 'DiceBot',
              result: '(1D100) ＞ 51',
              timestamp: Date.now() + i,
            }))}
          />
        </div>

        <div>
          <QuickInput
            items={[
              { isFavorite: true, value: '1d100' },
              { isFavorite: true, value: '1d6' },
              { isFavorite: false, value: '1d10' },
            ]}
          />
        </div>

        <div className="flex gap-4">
          <Input placeholder="コマンドを入力してください" className="flex-1" />
          <Button>ロール</Button>
        </div>
      </div>

      <ContainerSection label="「DiceBot」の使い方">
        <RichText
          className="text-sm"
          text={`3D6+1>=9 ：3d6+1で目標値9以上かの判定
1D100<=50 ：D100で50％目標の下方ロールの例
3U6[5] ：3d6のダイス目が5以上の場合に振り足しして合計する(上方無限)
3B6 ：3d6のダイス目をバラバラのまま出力する（合計しない）
10B6>=4 ：10d6を振り4以上のダイス目の個数を数える
2R6[>3]>=5 ：2D6のダイス目が3より大きい場合に振り足して、5以上のダイス目の個数を数える
(8/2)D(4+6)<=(5*3)：個数・ダイス・達成値には四則演算も使用可能
c(10-4*3/2+2)：c(計算式）で計算だけの実行も可能
choice[a,b,c]：列挙した要素から一つを選択表示。ランダム攻撃対象決定などに
S3d6 ： 各コマンドの先頭に「S」を付けると他人結果の見えないシークレットロール
3d6/2 ： ダイス出目を割り算（端数処理はゲームシステム依存）。切り上げは /2C、四捨五入は /2R、切り捨ては /2F
D66 ： D66ダイス。順序はゲームに依存。D66N：そのまま、D66A：昇順、D66D：降順

詳細は下記URLのコマンドガイドを参照
https://docs.bcdice.org/`}
        />
      </ContainerSection>

      <div>
        <AdvancedSettings />
      </div>
    </div>
  );
};

export default DicePage;
