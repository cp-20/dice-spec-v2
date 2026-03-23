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

const LEGAL_LAST_UPDATED = '2026-03-23';

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
            <H2>事業者氏名</H2>
            <P>永田直希</P>
          </Section>

          <Section>
            <H2>お問合せ先</H2>
            <P>メールアドレス: contact@dicespec.app</P>
            <P className="text-xs">
              開示されていない情報に関しては、上記お問い合わせ先までご連絡いただければ遅滞なく開示いたします。
            </P>
          </Section>

          <Section>
            <H2>販売価格と手数料</H2>
            <P>販売ページおよび購入手続きの画面において、消費税・手数料を含む価格で表示されています。</P>
            <P>本サービスの利用に必要となるインターネット通信料金はお客様のご負担となります。</P>
            <P>デジタルコンテンツ（役務）のため送料や返品送料は発生しません。</P>
          </Section>

          <Section>
            <H2>提供時期</H2>
            <P>お支払いが確認でき次第、すぐに利用できるようになります。</P>
          </Section>

          <Section>
            <H2>お支払方法</H2>
            <P>
              クレジットカード、またはその他当社が定める方法（Apple Pay、Google Pay、Stripe
              Link）によりお支払いいただきます。
            </P>
          </Section>

          <Section>
            <H2>お支払時期</H2>
            <P>
              利用料金のお支払いは利用期間ごとの前払いとし、お支払時期は初回を有料サービス登録時、以降は1ヶ月または1年ごとの同日となります（翌月または翌年に同日がない場合は、その月の末日となります）。
            </P>
            <P>クレジットカード会社からお客様への請求時期は、お客様とクレジットカード会社との間の契約に基づきます。</P>
          </Section>

          <Section>
            <H2>返品・キャンセル・解約について</H2>
            <P>デジタルサービスという性質上、お客様都合による返金・キャンセルはお受けしておりません。</P>
            <P>
              弊社の責による長期システム停止等、当社利用規約で定める場合に限り、未提供日数を日割り計算の上で返金いたします。
            </P>
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
