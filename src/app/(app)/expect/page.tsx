import { IconChartBar, IconSearch } from '@tabler/icons-react';
import type { NextPage } from 'next';
import {
  PageDescriptionContainer,
  PageDescriptionText,
} from '@/app/(app)/_components/PageDescription';
import { PageTitle } from '@/app/(app)/_components/PageTitle';
import { InlineCommand } from '@/app/(app)/expect/_components/InlineCommand';
import { Stats } from '@/shared/components/elements/Stats';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';

const ExpectPage: NextPage = () => (
  <div className="space-y-12">
    <div>
      <PageTitle icon={IconSearch}>ダイス予測</PageTitle>
      <PageDescriptionContainer>
        <PageDescriptionText>
          <InlineCommand>1d6</InlineCommand>や
          <InlineCommand>1D100</InlineCommand>
          といったダイスの期待値などを計算することで、ダイスを振るときにどういう結果が出るのかを予測できます。
        </PageDescriptionText>
        <PageDescriptionText>
          さらに
          <InlineCommand>{'1d100<=10'}</InlineCommand>や
          <InlineCommand>{'2D6>=10'}</InlineCommand>
          と入力することで、その確率も知ることができます。
        </PageDescriptionText>
      </PageDescriptionContainer>
    </div>

    <div className="space-y-4">
      <Input placeholder="計算式を入力してください" />
      <div className="items-top flex space-x-2">
        <Checkbox id="autoRecalculation" />
        <label
          htmlFor="autoRecalculation"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          変更時に自動で再計算
        </label>
      </div>
    </div>

    <div className="@container">
      <div className="grid gap-2 @[300px]:grid-cols-2 @[400px]:grid-cols-3 @[800px]:grid-cols-6">
        <Stats label="確率" number="16.67" unit="%" />
        <Stats label="平均" number="7" />
        <Stats label="信頼区間 (P95)" number="2.1～11.9" />
        <Stats label="標準偏差" number="2.4" />
        <Stats label="分散" number="5.8" />
        <Stats label="範囲" number="2～12" />
      </div>
    </div>

    <div className="flex items-center justify-center gap-2 rounded-md border p-8">
      <IconChartBar />
      <div className="text-xl">ここにグラフ</div>
    </div>
  </div>
);

export default ExpectPage;
