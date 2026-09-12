import LogoIcon from '/public/icon.svg';
import type { IconProps } from '@tabler/icons-react';
import { IconDice5, IconSearch, IconTimeline } from '@tabler/icons-react';
import type { NextPage } from 'next';
import type { FC } from 'react';

import { CustomLink } from '@/shared/components/elements/CustomLink';
import { TitleLogo } from '@/shared/components/elements/TitleLogo';
import { Footer } from '@/shared/components/Layout/Footer';
import { H2 } from '@/shared/components/Typography/H2';
import { Text } from '@/shared/components/Typography/Text';
import { Button } from '@/shared/components/ui/button';
import { type MetadataGenerator, metadataHelper, viewportGenerator } from '@/shared/lib/metadataGenerator';

import { LinkableIconPanel } from './_components/LinkableIconPanel';
import { Panel } from './_components/Panel';

export const generateMetadata: MetadataGenerator = async () => {
  return metadataHelper({
    description:
      'ダイススペックはTRPGのちょっとしたツールを集めたサービスです。ダイス予測、ダイスロール、ログ解析といった豊富なツールが用意されており、それらの機能を基本無料でお使いいただけます。',
    path: '/',
  });
};
export const viewport = viewportGenerator();

const featureIcons: Record<string, FC<IconProps>> = {
  expect: IconSearch,
  dice: IconDice5,
  'analyze-logs': IconTimeline,
};

const LandingPage: NextPage = () => {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="mx-auto flex w-full max-w-(--breakpoint-lg) flex-1 flex-col items-center gap-16 px-8 py-8 max-sm:px-4">
        <div className="mt-16 flex max-w-full items-center justify-center gap-8 max-md:mt-8 max-md:flex-col max-md:gap-2 max-sm:mt-4">
          <div>
            <LogoIcon className="size-32 max-sm:h-24 max-sm:w-24" />
          </div>

          <div className="flex max-w-full flex-col">
            <h1 className="max-w-full max-md:mx-auto max-md:px-4">
              <TitleLogo className="max-w-full text-slate-800 md:h-16 max-md:w-full" />
            </h1>

            <Text className="text-balance max-md:text-center">
              ダイススペックはTRPGのちょっとしたツールを集めたサービスです。
            </Text>
          </div>
        </div>

        <Button className="font-bold" asChild>
          <CustomLink href="/expect">今すぐ使ってみる！</CustomLink>
        </Button>

        <div>
          <H2 className="m-0 mb-4 border-none p-0 text-center text-xl">ダイススペックの機能</H2>

          <div className="flex gap-4 max-md:flex-col">
            {[
              {
                key: 'expect',
                title: 'ダイス予測',
                description:
                  'ダイスの期待値などを計算します。ダイスを振るときに、どういう結果が出るのかを予測できます。',
              },
              {
                key: 'dice',
                title: 'ダイスロール',
                description:
                  '1D6、2D6、3D6、1D100、2D10、2D3 といったダイスはもちろん、どんな複雑なダイスでも振ることができます！クトルゥフ神話TRPGやシノビガミといったゲームシステム特有のダイスにも対応しています！',
              },
              {
                key: 'analyze-logs',
                title: 'ログ解析',
                description:
                  'ココフォリアのログを分析してダイスの平均値や偏差値を計算します。「このセッションはダイス運悪かった気がするけど実際どうなんだろう？」と思っているあなた、ぜひ一度使ってみてください！　クトゥルフ神話TRPG、新クトゥルフTRPG、エモクロア、シノビガミに対応しています。',
              },
            ].map(({ key, title, description }) => (
              <LinkableIconPanel
                key={key}
                href={`/${key}`}
                icon={featureIcons[key]}
                label={title}
                contents={description}
                className="md:flex-1"
              />
            ))}
          </div>
        </div>

        <div>
          <H2 className="m-0 mb-4 border-none p-0 text-center text-xl">ダイススペックの特長</H2>

          <div className="flex gap-4 max-md:flex-col">
            {[
              { label: '高度な機能', contents: '難しい計算や複雑な集計も、ダイススペックなら簡単にできます！' },
              {
                label: '軽快な動作',
                contents:
                  'ダイススペックはパフォーマンスを意識した設計になっており、処理を待つ時間はほとんどありません。',
              },
              {
                label: 'オープンソース',
                contents:
                  'ダイススペックは全てオープンソースで開発されており、誰でも自由に閲覧・修正提案を行うことができます。なのでユーザーも安心して使うことができます',
              },
            ].map(({ label, contents }) => (
              <Panel key={label} label={label} contents={contents} className="md:flex-1" />
            ))}
          </div>
        </div>

        <div>
          <H2 className="m-0 mb-4 border-none p-0 text-center text-xl">クレジット</H2>

          <a
            className="underline hover:text-slate-500"
            href="https://www.flaticon.com/free-icons/dice"
            target="_blank"
            rel="noopener noreferrer"
          >
            Dice icons created by Tanah Basah - Flaticon
          </a>
        </div>

        <div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
            <CustomLink href="/terms" className="underline underline-offset-2 hover:text-slate-600">
              利用規約
            </CustomLink>

            <CustomLink href="/privacy-policy" className="underline underline-offset-2 hover:text-slate-600">
              プライバシーポリシー
            </CustomLink>

            <CustomLink
              href="/specified-commercial-transactions"
              className="underline underline-offset-2 hover:text-slate-600"
            >
              特定商取引法に基づく表記
            </CustomLink>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
