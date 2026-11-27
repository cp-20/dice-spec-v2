import { IconSparkles } from '@tabler/icons-react';
import type { NextPage } from 'next';

import { ContainerSection } from '@/app/(app)/_components/ContainerSection';
import { PageDescriptionContainer, PageDescriptionText } from '@/app/(app)/_components/PageDescription';
import { PageTitle } from '@/app/(app)/_components/PageTitle';
import { PricingCards } from '@/app/(app)/profile/_components/PricingCards';
import { CCFOLIA_CHARACTER_SAVE_LIMIT_FREE } from '@/features/ccfolia/model';
import { SAVE_ANALYSIS_LIMIT_FREE } from '@/features/log-analysis/model';
import { PRO_PRICE_JPY } from '@/features/stripe/contract';
import { type MetadataGenerator, metadataHelper, viewportGenerator } from '@/shared/lib/metadataGenerator';

export const generateMetadata: MetadataGenerator = async () =>
  metadataHelper({
    title: 'PROプラン・料金',
    description: `ダイススペックのPROプランは月額${PRO_PRICE_JPY.monthly}円・年額${PRO_PRICE_JPY.yearly}円。ログ解析で技能ごとの成功率をすべて確認でき、解析結果やココフォリアのキャラクターを無制限に保存できます。`,
    path: '/pricing',
  });

export const viewport = viewportGenerator();

const comparison = [
  { feature: 'ダイスロール・ダイス予測・ログ解析', free: '使える', pro: '使える' },
  { feature: '技能ごとの成功率', free: '一部', pro: 'すべて' },
  { feature: 'ログ解析結果の保存', free: `${SAVE_ANALYSIS_LIMIT_FREE}件まで`, pro: '無制限' },
  { feature: 'ココフォリアのキャラクター保存', free: `${CCFOLIA_CHARACTER_SAVE_LIMIT_FREE}件まで`, pro: '無制限' },
];

const PricingPage: NextPage = () => (
  <div className="space-y-12">
    <div>
      <PageTitle icon={IconSparkles}>PROプラン</PageTitle>
      <PageDescriptionContainer>
        <PageDescriptionText>
          基本機能は無料で使えます。PROプランでは技能ごとの成功率をすべて確認でき、保存件数の上限がなくなります。
        </PageDescriptionText>
      </PageDescriptionContainer>
    </div>

    <ContainerSection label="フリープランとPROプランの違い">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th scope="col" className="py-3 pr-4">
              機能
            </th>
            <th scope="col" className="py-3 pr-4">
              フリー
            </th>
            <th scope="col" className="py-3">
              PRO
            </th>
          </tr>
        </thead>
        <tbody>
          {comparison.map(({ feature, free, pro }) => (
            <tr key={feature} className="border-b last:border-b-0">
              <th scope="row" className="py-2 pr-4 font-normal">
                {feature}
              </th>
              <td className="whitespace-nowrap py-2 pr-4">{free}</td>
              <td className="whitespace-nowrap py-2 font-semibold">{pro}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ContainerSection>

    <PricingCards />

    <ContainerSection label="よくある質問">
      <dl className="space-y-4 text-sm">
        <div className="space-y-1">
          <dt className="font-semibold">解約はどこからできますか？</dt>
          <dd>アカウント情報の「Stripeでサブスクリプションを管理する」から、いつでも解約できます。</dd>
        </div>
        <div className="space-y-1">
          <dt className="font-semibold">支払いはどのように行われますか？</dt>
          <dd>決済サービスのStripeを利用しています。カード情報はダイススペックに保存されません。</dd>
        </div>
      </dl>
    </ContainerSection>
  </div>
);

export default PricingPage;
