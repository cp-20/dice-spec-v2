import {
  IconBrandX,
  IconChartBar,
  IconChevronsRight,
  IconTimeline,
  IconUpload,
} from '@tabler/icons-react';
import type { NextPage } from 'next';
import {
  PageDescriptionContainer,
  PageDescriptionText,
} from '@/app/(app)/_components/PageDescription';
import { PageTitle } from '@/app/(app)/_components/PageTitle';
import { DiceLogList } from '@/app/(app)/analyze-logs/_components/DiceLogList';
import { Stats } from '@/shared/components/elements/Stats';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

const AnalyzeLogsPage: NextPage = () => (
  <div className="space-y-12">
    <div>
      <PageTitle icon={IconTimeline}>ログ解析</PageTitle>
      <PageDescriptionContainer>
        <PageDescriptionText>
          ココフォリアから出力されたログを解析して、ダイスの出目を抽出・分析します。
        </PageDescriptionText>
        <PageDescriptionText>
          (クトゥルフ神話TRPG・新クトゥルフ神話TRPGのみ対応)
        </PageDescriptionText>
      </PageDescriptionContainer>
    </div>
    <div className="space-y-4">
      <Button variant="outline" className="inline-flex h-fit w-full gap-2 p-4">
        <IconUpload />
        <span>
          クリックしてアップロード、あるいはドラッグアンドドロップしてアップロード
        </span>
      </Button>

      <Select>
        <SelectTrigger className="w-full font-bold">
          <SelectValue
            placeholder={<span className="text-slate-500">キャラを選択</span>}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="font-bold">
            [ALL]
          </SelectItem>
          <SelectItem value="character-1">キャラ1</SelectItem>
          <SelectItem value="character-2">キャラ2</SelectItem>
          <SelectItem value="character-3">キャラ3</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="grid place-content-center">
      <IconChevronsRight className="rotate-90" size="64" />
    </div>

    <div className="space-y-4">
      <div className="@container">
        <div className="grid grid-cols-2 gap-4 @lg:grid-cols-4">
          <Stats label="平均" number="45.5" />
          <Stats label="ダイス偏差値" number="62.1" />
          <Stats label="成功率" number="75" unit="%" />
          <Stats label="ダイスを振った回数" number="44" unit="回" />
        </div>
      </div>

      <div>
        <Button variant="secondary" className="w-full">
          <IconBrandX />
          <span>解析結果をシェア</span>
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-1 items-center justify-center gap-2 rounded-md border p-8">
          <IconChartBar />
          <span>ここにグラフ</span>
        </div>
        <div className="flex flex-1 items-center justify-center gap-2 rounded-md border p-8">
          <IconChartBar />
          <span>ここにグラフ</span>
        </div>
      </div>
    </div>

    <div>
      <DiceLogList
        logs={[
          {
            value: '[メイン] CCB<=75 【目星】 (1D100<=75) ＞ 39 ＞ 成功',
            variant: 'success',
          },
          {
            value: '[メイン] CCB<=70 【聞き耳】 (1D100<=70) ＞ 7 ＞ スペシャル',
            variant: 'success',
          },
          {
            value: '[メイン] CCB<=20 【聞き耳】 (1D100<=20) ＞ 93 ＞ 失敗',
            variant: 'failed',
          },
          {
            value: '[メイン] CCB<=70 【聞き耳】 (1D100<=70) ＞ 18 ＞ 成功',
            variant: 'success',
          },
          {
            value:
              '[メイン] CCB<=46 【聞き耳】 (1D100<=46) ＞ 100 ＞ 致命的失敗',
            variant: 'failed',
          },
          {
            value: '[メイン] CCB<=60 【鑑定】 (1D100<=60) ＞ 67 ＞ 失敗',
            variant: 'failed',
          },
          {
            value:
              '[メイン] CCB<=90 【近接戦闘(格闘)】 (1D100<=90) ＞ 62 ＞ 成功',
            variant: 'success',
          },
          {
            value:
              '[メイン] CC<=45 【SAN値チェック】 (1D100<=45) ＞ 40 ＞ 成功',
            variant: 'success',
          },
          {
            value:
              '[メイン] CC<=40 【SAN値チェック】 (1D100<=40) ＞ 17 ＞ 成功',
            variant: 'success',
          },
          {
            value: '[メイン] CCB<=70 【聞き耳】 (1D100<=70) ＞ 79 ＞ 失敗',
            variant: 'failed',
          },
          {
            value:
              '[メイン] CC<=40 【SAN値チェック】 (1D100<=40) ＞ 77 ＞ 失敗',
            variant: 'failed',
          },
          {
            value:
              '[メイン] CC<=45 【SAN値チェック】 (1D100<=45) ＞ 28 ＞ 成功',
            variant: 'success',
          },
          {
            value:
              '[メイン] CCB<=50 【SAN値チェック】 (1D100<=50) ＞ 46 ＞ 成功',
            variant: 'success',
          },
          {
            value: '[メイン] CCB<=46 【聞き耳】 (1D100<=46) ＞ 41 ＞ 成功',
            variant: 'success',
          },
          {
            value: '[メイン] CCB<=70 【聞き耳】 (1D100<=70) ＞ 21 ＞ 成功',
            variant: 'success',
          },
          {
            value: '[メイン] CCB<=20 【聞き耳】 (1D100<=20) ＞ 61 ＞ 失敗',
            variant: 'failed',
          },
          {
            value: '[メイン] CCB<=80 【近接戦闘】 (1D100<=80) ＞ 67 ＞ 成功',
            variant: 'success',
          },
          {
            value:
              '[メイン] CCB<=90 【近接戦闘(格闘)】 (1D100<=90) ＞ 53 ＞ 成功',
            variant: 'success',
          },
          {
            value: '[メイン] CCB<=70 【アイデア】 (1D100<=70) ＞ 38 ＞ 成功',
            variant: 'success',
          },
          {
            value: '[メイン] CCB<=80 【目星】 (1D100<=80) ＞ 24 ＞ 成功',
            variant: 'success',
          },
          {
            value: '[メイン] CCB<=65 【INT】 (1D100<=65) ＞ 38 ＞ 成功',
            variant: 'success',
          },
          {
            value: '[メイン] CCB<=70 【INT】 (1D100<=70) ＞ 33 ＞ 成功',
            variant: 'success',
          },
          {
            value:
              '[メイン] CCB<=80 【INT】 (1D100<=80) ＞ 4 ＞ 決定的成功/スペシャル',
            variant: 'success',
          },
          {
            value: '[メイン] CCB<=65 【目星】 (1D100<=65) ＞ 6 ＞ スペシャル',
            variant: 'success',
          },
          {
            value:
              '[メイン] CCB<=90 【近接戦闘(格闘)】 (1D100<=90) ＞ 8 ＞ スペシャル',
            variant: 'success',
          },
          {
            value:
              '[メイン] CCB<=80 【近接戦闘】 (1D100<=80) ＞ 1 ＞ 決定的成功/スペシャル',
            variant: 'success',
          },
          {
            value:
              '[メイン] CC<=45 【SAN値チェック】 (1D100<=45) ＞ 85 ＞ 失敗',
            variant: 'failed',
          },
          {
            value:
              '[メイン] CC<=38 【SAN値チェック】 (1D100<=38) ＞ 18 ＞ 成功',
            variant: 'success',
          },
          {
            value:
              '[メイン] CCB<=50 【SAN値チェック】 (1D100<=50) ＞ 10 ＞ スペシャル',
            variant: 'success',
          },
          {
            value: '[メイン] CCB<=75 【目星】 (1D100<=75) ＞ 36 ＞ 成功',
            variant: 'success',
          },
          {
            value: '[メイン] CCB<=80 【アイデア】 (1D100<=80) ＞ 78 ＞ 成功',
            variant: 'success',
          },
          {
            value: '[メイン] CCB<=75 【目星】 (1D100<=75) ＞ 62 ＞ 成功',
            variant: 'success',
          },
          {
            value: '[メイン] CCB<=80 【INT】 (1D100<=80) ＞ 71 ＞ 成功',
            variant: 'success',
          },
          {
            value: '[メイン] CCB<=70 【INT】 (1D100<=70) ＞ 18 ＞ 成功',
            variant: 'success',
          },
          {
            value: '[メイン] CCB<=65 【INT】 (1D100<=65) ＞ 42 ＞ 成功',
            variant: 'success',
          },
          {
            value: '[メイン] CCB<=70 【INT】 (1D100<=70) ＞ 30 ＞ 成功',
            variant: 'success',
          },
          {
            value: '[メイン] CCB<=80 【INT】 (1D100<=80) ＞ 93 ＞ 失敗',
            variant: 'failed',
          },
          {
            value: '[メイン] CCB<=65 【INT】 (1D100<=65) ＞ 85 ＞ 失敗',
            variant: 'failed',
          },
          {
            value: '[メイン] CCB<=50 【DEX】 (1D100<=50) ＞ 88 ＞ 失敗',
            variant: 'failed',
          },
          {
            value: '[メイン] CCB<=50 【DEX】 (1D100<=50) ＞ 44 ＞ 成功',
            variant: 'success',
          },
          {
            value: '[メイン] CCB<=80 【INT】 (1D100<=80) ＞ 39 ＞ 成功',
            variant: 'success',
          },
          {
            value:
              '[メイン] CC<=38 【SAN値チェック】 (1D100<=38) ＞ 57 ＞ 失敗',
            variant: 'failed',
          },
          {
            value:
              '[メイン] CCB<=50 【SAN値チェック】 (1D100<=50) ＞ 39 ＞ 成功',
            variant: 'success',
          },
          {
            value:
              '[メイン] CC<=42 【SAN値チェック】 (1D100<=42) ＞ 37 ＞ 成功',
            variant: 'success',
          },
        ]}
      />
    </div>
  </div>
);

export default AnalyzeLogsPage;
