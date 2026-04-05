import { t } from 'i18next';
import type { NextPage } from 'next';
import Link from 'next/link';

import { Footer } from '@/shared/components/Layout/Footer';
import { wrapPage } from '@/shared/i18n/page-layout';
import {
  localeHelper,
  type MetadataGenerator,
  metadataHelper,
  viewportGenerator,
} from '@/shared/lib/metadataGenerator';

import { H1, H2, Li, P, Section, Ul } from '../_components/Markdown';

export const generateMetadata: MetadataGenerator = async (props) => {
  const locale = await localeHelper(props);

  return metadataHelper({
    title: t('legal:commerce.metadata.title'),
    description: t('legal:commerce.metadata.description'),
    path: '/specified-commercial-transactions',
    locale,
  });
};

export const viewport = viewportGenerator();

const LEGAL_LAST_UPDATED = '2026-03-27';

const SpecifiedCommercialTransactionsPage: NextPage = () => {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="mx-auto flex w-full max-w-(--breakpoint-lg) flex-1 flex-col gap-8 px-8 py-10 max-sm:px-4">
        <header className="space-y-2">
          <H1>{t('legal:commerce.title')}</H1>
          <P className="text-sm leading-normal text-slate-500">最終更新日: {LEGAL_LAST_UPDATED}</P>
        </header>

        <section className="space-y-8">
          <Section>
            <H2>販売事業者の名称</H2>
            <P>永田直希</P>
          </Section>

          <Section>
            <H2>運営統括責任者</H2>
            <P>永田直希</P>
          </Section>

          <Section>
            <H2>所在地</H2>
            <P className="text-xs">請求があった場合には、遅滞なく開示いたします。</P>
          </Section>

          <Section>
            <H2>電話番号</H2>
            <P className="text-xs">請求があった場合には、遅滞なく開示いたします。</P>
          </Section>

          <Section>
            <H2>メールアドレス</H2>
            <P>contact@dicespec.app</P>
          </Section>

          <Section>
            <H2>お問い合わせ受付時間</H2>
            <P>10:00～19:00（返信は通常3営業日以内）</P>
          </Section>

          <Section>
            <H2>販売価格</H2>
            <P>販売ページおよび購入手続き画面に、消費税を含む価格を表示します。</P>
          </Section>

          <Section>
            <H2>商品代金以外の必要料金</H2>
            <P>本サービスの利用に必要となるインターネット接続料金・通信料金はお客様のご負担となります。</P>
            <P>デジタルコンテンツ（役務）のため、送料は発生しません。</P>
          </Section>

          <Section>
            <H2>提供時期</H2>
            <P>決済完了後、直ちにサービスをご利用いただけます。</P>
          </Section>

          <Section>
            <H2>お支払方法</H2>
            <P>クレジットカード、またはその他運営が定める方法によりお支払いいただきます。</P>
          </Section>

          <Section>
            <H2>お支払時期</H2>
            <P>
              利用料金のお支払いは利用期間ごとの前払いとし、お支払時期は初回を有料サービス登録時、以降は1ヶ月または1年ごとの同日となります（翌月または翌年に同日がない場合は、その月の末日となります）。
            </P>
            <P>クレジットカード会社からお客様への請求時期は、お客様とクレジットカード会社との間の契約に基づきます。</P>
          </Section>

          <Section>
            <H2>返品・交換・キャンセル等</H2>
            <P className="font-semibold text-slate-700">お客様都合による返品・交換・キャンセル</P>
            <P>デジタルサービスの性質上、決済完了後のお客様都合による返金・キャンセルはお受けしておりません。</P>
            <P className="font-semibold text-slate-700">不具合がある場合の返品・交換</P>
            <P>
              運営の責に帰すべき不具合（長期システム停止等）が発生した場合は、利用規約に基づき未提供日数を日割り計算のうえ返金いたします。
            </P>
            <P className="font-semibold text-slate-700">解約方法</P>
            <P>
              マイページから次回更新日の24時間前までに解約いただけます。解約後も当該請求期間の終了日まではサービスをご利用いただけます。
            </P>
          </Section>

          <Section>
            <H2>推奨するご利用環境</H2>
            <P>以下の環境でのご利用を推奨します。お支払い前にあらかじめご利用環境での動作をご確認ください。</P>
            <P>Web版（ブラウザ）</P>
            <Ul>
              <Li>macOSの場合、ChromeまたはSafariの最新版</Li>
              <Li>Windowsの場合、EdgeまたはChromeの最新版</Li>
              <Li>iOSの場合、Safariの最新版</Li>
              <Li>Androidの場合、Chromeの最新版</Li>
            </Ul>
            <P className="pt-2 leading-8 text-slate-700">デスクトップ版</P>
            <Ul>
              <Li>macOSの場合、Apple Silicon搭載のmacOS 14以上</Li>
              <Li>Windowsの場合、Windows 11以上</Li>
            </Ul>
          </Section>
        </section>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
          <Link href={t('link', { href: '/' })} className="underline underline-offset-2 hover:text-slate-900">
            {t('legal:back-to-top')}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default wrapPage(SpecifiedCommercialTransactionsPage);
