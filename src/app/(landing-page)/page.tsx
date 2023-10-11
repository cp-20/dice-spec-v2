import {
  IconBrandDiscord,
  IconBrandX,
  IconDice5,
  IconSearch,
  IconTimeline,
} from '@tabler/icons-react';
import { IconBrandGithub } from '@tabler/icons-react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { ExternalLinkWithIcon } from './_components/ExternalLinkWithIcon';
import { LinkableIconPanel } from './_components/LinkableIconPanel';
import { Panel } from './_components/Panel';
import { Footer } from '@/shared/components/Layout/Footer';
import { H2 } from '@/shared/components/Typography/H2';
import { Text } from '@/shared/components/Typography/Text';
import { UpdateAnnouncement } from '@/shared/components/elements/UpdateAnnouncement';
import { Button } from '@/shared/components/ui/button';
import { metadataGenerator } from '@/shared/lib/metadataGenerator';
import LogoIcon from '/public/icon.svg';
import TitleLogo from '/public/title-logo.svg';

export const metadata = metadataGenerator({
  title: '',
  description:
    'ダイススペックはTRPGのちょっとしたツールを集めたサービスです。ダイス予測、ダイスロール、ログ解析といったツールが用意されており、それらを全て無料で使うことができます。',
});

const LandingPage: NextPage = () => {
  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <UpdateAnnouncement />
        <main className="mx-auto flex w-full max-w-screen-lg flex-1 flex-col items-center gap-16 px-8 py-8 max-sm:px-4">
          <div className="mt-16 flex max-w-full items-center justify-center gap-8 max-md:mt-8 max-md:flex-col max-md:gap-2 max-sm:mt-4">
            <div>
              <LogoIcon className="h-32 w-32 max-sm:h-24 max-sm:w-24" />
            </div>

            <div className="flex max-w-full flex-col">
              <h1 className="max-w-full max-md:mx-auto max-md:px-4">
                <TitleLogo className="max-w-full text-slate-800 md:h-16" />
              </h1>

              <Text className="max-md:text-center">
                <span className="inline-block whitespace-nowrap">
                  ダイススペックは
                </span>
                <span className="inline-block whitespace-nowrap">
                  TRPGのちょっとしたツールを
                </span>
                <span className="inline-block whitespace-nowrap">
                  集めたサービスです。
                </span>
              </Text>
            </div>
          </div>

          <Button className="font-bold" asChild>
            <Link href="/expect">今すぐ使ってみる！</Link>
          </Button>

          <div>
            <H2 className="m-0 mb-4 border-none p-0 text-center text-xl">
              ダイススペックの機能
            </H2>

            <div className="flex gap-4 max-md:flex-col">
              <LinkableIconPanel
                href="/expect"
                icon={IconSearch}
                label="ダイス予測"
                contents="ダイスの期待値などを計算します。ダイスを振るときに、どういう結果が出るのかを予測できます。"
                className="md:flex-1"
              />
              <LinkableIconPanel
                href="/dice"
                icon={IconDice5}
                label="ダイスロール"
                contents="好きなダイスを振ることができます。BCDiceを使っているため、CCFOLIAなどのセッションツールと変わらない使い心地で使えます。"
                className="md:flex-1"
              />
              <LinkableIconPanel
                href="/analyze-logs"
                icon={IconTimeline}
                label="ログ解析"
                contents="ココフォリアのログを分析してダイスの平均値などを計算します。「このセッションはダイス運悪かった気がするけど実際どうなんだろう？」と思っているあなた、ぜひ一度使ってみてください！"
                className="md:flex-1"
              />
            </div>
          </div>

          <div>
            <H2 className="m-0 mb-4 border-none p-0 text-center text-xl">
              ダイススペックの特長
            </H2>

            <div className="flex gap-4 max-md:flex-col">
              <Panel
                label="完全無料"
                contents="ダイススペックの利用に料金は一切かかりません。"
                className="md:flex-1"
              />
              <Panel
                label="軽快な動作"
                contents="ダイススペックはパフォーマンスを意識した設計になっており、処理を待つ時間はほとんどありません。"
                className="md:flex-1"
              />
              <Panel
                label="オープンソース"
                contents="ダイススペックは全てオープンソースで開発されており、誰でも自由に閲覧・修正提案を行うことができます。なのでユーザーも安心して使うことができます"
                className="md:flex-1"
              />
            </div>
          </div>

          <div>
            <H2 className="m-0 mb-4 border-none p-0 text-center text-xl">
              関連リンク
            </H2>

            <div className="flex gap-4 max-md:flex-col">
              <ExternalLinkWithIcon
                icon={IconBrandDiscord}
                href="https://discord.gg/YQ7negGTUK"
              >
                サポートコミュニティ
              </ExternalLinkWithIcon>
              <ExternalLinkWithIcon
                icon={IconBrandX}
                href="https://twitter.com/__cp20__"
              >
                開発者のつぶやき
              </ExternalLinkWithIcon>
              <ExternalLinkWithIcon
                icon={IconBrandGithub}
                href="https://github.com/cp-20/dice-spec-v2"
              >
                GitHubのリポジトリ
              </ExternalLinkWithIcon>
            </div>
          </div>

          <div>
            <H2 className="m-0 mb-4 border-none p-0 text-center text-xl">
              クレジット
            </H2>

            <Link
              className="underline hover:text-slate-500"
              href="https://www.flaticon.com/free-icons/dice"
              target="_blank"
              rel="noopener noreferrer"
            >
              Dice icons created by Tanah Basah - Flaticon
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;
