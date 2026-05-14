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

import { H1, H2, Li, Link as MarkdownLink, P, Section, Ul } from '../_components/Markdown';

export const generateMetadata: MetadataGenerator = async (props) => {
  const locale = await localeHelper(props);

  return metadataHelper({
    title: t('legal:terms.metadata.title'),
    description: t('legal:terms.metadata.description'),
    path: '/terms',
    locale,
  });
};

export const viewport = viewportGenerator();

const LEGAL_LAST_UPDATED = '2026-03-23';

const TermsPage: NextPage = () => {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="mx-auto flex w-full max-w-(--breakpoint-lg) flex-1 flex-col gap-8 px-8 py-10 max-sm:px-4">
        <header className="space-y-2">
          <H1>{t('legal:terms.title')}</H1>
          <P className="text-sm leading-normal text-slate-500">最終更新日: {LEGAL_LAST_UPDATED}</P>
          <P className="text-sm leading-relaxed text-slate-700">
            本利用規約（以下「本規約」といいます。）は、ダイススペック上で提供するサービスの利用条件を定めるものです。本サービスのユーザー（以下「お客様」といいます。）は、本規約に同意したうえで、本サービスをご利用いただきます。
          </P>
        </header>

        <section className="space-y-10">
          <Section>
            <H2>第1条 アカウントおよび利用資格</H2>
            <P>
              1.1 アカウント作成:
              運営が認めた外部IDプロバイダーを通じてアカウントを作成することで、特定の機能をご利用いただけます。
            </P>
            <P>
              1.2 過去のアカウント停止:
              過去に本規約違反等によりアカウントが停止または解約されたことがあるお客様またはその所属する組織については、運営は登録を拒否または既存アカウントの解約を行う権利を留保します。
            </P>
            <P>1.3 情報の正確性: お客様は、アカウント情報を正確かつ最新の状態に維持することに同意するものとします。</P>
          </Section>

          <Section>
            <H2>第2条 サービスの内容</H2>
            <P>
              本サービスは、TRPG関連ツールを提供いたします。これにはダイス予測機能、ダイスロール機能、ログ解析機能、ココフォリア出力機能などが含まれます。
            </P>
            <Ul>
              <Li>無料プラン: 無料プランではログ解析結果の保存件数に制限があります。</Li>
              <Li>有料サブスクリプションプラン: 有料プランでは保存件数の制限が緩和されます。</Li>
            </Ul>
            <P>運営は、プランの機能、特典、利用制限を随時変更することがあります。</P>
          </Section>

          <Section>
            <H2>第3条 サービス利用許諾</H2>
            <P>
              運営は、本規約に従って本サービスへのアクセスおよび利用を行う非独占的、取消可能、譲渡不可、限定的な利用許諾をお客様に付与します。お客様は以下の行為を行ってはなりません。
            </P>
            <Ul>
              <Li>本サービスの再販（明示的に許可された場合を除く）</Li>
              <Li>競合製品の開発または違法な目的での利用</Li>
            </Ul>
          </Section>

          <Section>
            <H2>第4条 サブスクリプション、料金および支払い</H2>
            <P>
              4.1 料金および請求サイクル:
              サブスクリプション料金は、選択した期間（月間または年間など）ごとに前払いで請求されます。
            </P>
            <P>4.2 自動更新: 現行期間終了前にキャンセルしない限り、同一期間で同額の料金にて自動更新されます。</P>
            <P>
              4.3 決済処理:
              決済は第三者プロバイダであるStripeを通じて行われ、運営はクレジットカード情報等の全情報を保存しません。
            </P>
            <P>
              4.4 解約および返金:
              アカウント設定からいつでも解約が可能です。解約により次回更新を停止しますが、既払い期間のサービス利用は有効期限まで継続します。既払い料金は原則として返金されません。ただし、法令により返金が義務付けられる場合はこの限りではありません。
            </P>
          </Section>

          <Section>
            <H2>第5条 ユーザーコンテンツおよび知的財産権</H2>
            <P>
              5.1 お客様のコンテンツ:
              お客様がログ解析のためにアップロードしたログファイルの権利はお客様に留保されます。明示的に保存・共有を行わない限り、これらの結果はサーバー上には保存されません。
            </P>
            <P>
              5.2 処理のための許諾:
              運営は、ログ解析の提供などを目的にユーザーコンテンツを使用します。著作権その他の権利はお客様に帰属し、当社は二次利用を行いません。
            </P>
            <P>
              5.3 運営の知的財産:
              本サービスに関するソフトウェア、アルゴリズムおよびコンテンツは運営またはライセンサーが保有します。本条に定める利用許諾を除き、いかなる権利も付与されません。
            </P>
          </Section>

          <Section>
            <H2>第6条 利用規約違反行為の禁止</H2>
            <P>お客様は以下の行為を行ってはなりません。</P>
            <Ul>
              <Li>法令または公序良俗に反する目的での利用</Li>
              <Li>マルウェア、スパムその他の不正な情報の送信</Li>
              <Li>利用制限回避のための複数無料アカウント作成や不正アクセス</Li>
              <Li>本サービスまたはセキュリティ機能の妨害・破壊</Li>
            </Ul>
            <P>運営は、違反が認められた場合、コンテンツやアカウントの停止・削除を行うことがあります。</P>
          </Section>

          <Section>
            <H2>第7条 プライバシー</H2>
            <P>
              本サービスのご利用にあたっては、運営の
              <MarkdownLink href="/privacy-policy">プライバシーポリシー</MarkdownLink>
              が適用されます。個人情報の収集、利用、保護方法については
              <MarkdownLink href="/privacy-policy">当該ポリシー</MarkdownLink>をご参照ください。
            </P>
          </Section>

          <Section>
            <H2>第8条 解約およびサービス停止</H2>
            <P>
              8.1 運営による停止・解約:
              お客様が本規約に違反した場合、運営は返金なしで利用停止またはアカウント解約を行うことができます。
            </P>
            <P>8.2 お客様による解約: 運営に個別にお問い合わせいただければ速やかに解約手続きをいたします。</P>
            <P>
              8.3 効力:
              解約後は本サービス利用許諾が終了し、運営はプライバシーポリシーおよび関連法令に従い、アカウント情報を削除できるものとします。
            </P>
          </Section>

          <Section>
            <H2>第9条 免責事項</H2>
            <P>
              本サービスは「現状有姿」「現状有効」で提供されます。法令で許容される最大限の範囲で、運営は明示的、黙示的、法定のいかなる保証も否認します。これには、商品性、特定目的適合性、非侵害性、翻訳精度、継続的運用保証などが含まれます。
            </P>
            <P>
              不可抗力:
              当事者は、天災地変、火災、洪水、地震、嵐、テロ、暴動、戦争、流行病、政府の行動、公私の通信網障害など、合理的な制御を超える事由による義務不履行や遅延について責任を負わないものとします。影響を受けた当事者は速やかに相手方に通知し、可能な限り履行を再開するよう努めます。
            </P>
          </Section>

          <Section>
            <H2>第10条 責任の制限</H2>
            <P>
              運営の本サービスまたは本規約に起因または関連して生じた一切の責任は、当該事象発生前12か月間にお客様が運営に支払った総額を上限とします。間接的、付随的、結果的、特別または懲罰的損害、利益喪失、データ損失、信用失墜については責任を負いません。
            </P>
          </Section>

          <Section>
            <H2>第11条 免責および補償</H2>
            <P>
              お客様は、本規約違反、ユーザーコンテンツ、または本サービスの不適切な利用から生じるいかなる請求、損失、損害（弁護士費用を含む）についても、運営およびその関連会社を免責し、防御し、補償するものとします。
            </P>
          </Section>

          <Section>
            <H2>第12条 規約変更</H2>
            <P>
              運営は本規約を随時変更できるものとし、ウェブサイト上に改定版を掲載し、「最終更新日」を更新します。お客様に不利益となる変更については、少なくとも30日前にメールにて通知するか、ウェブサイトまたはアプリケーション上で明示的な同意を取得します。改定後に本サービスを継続利用した場合、改定内容に同意したものとみなします。
            </P>
          </Section>

          <Section>
            <H2>第13条 通知および連絡先</H2>
            <P>
              本規約や本サービスに関するご質問は、アプリケーション内のフィードバックフォームまたは contact@dicespec.app
              宛にメールでお問い合わせください。正式な法的通知は電子メールで行い、送信の翌営業日に受領されたものとします。
            </P>
          </Section>

          <Section>
            <H2>第14条 準拠法</H2>
            <P>
              本規約および本サービスに関連する紛争は、日本法に準拠し、その解釈および適用にあたっては日本法を専属的に適用します。
            </P>
          </Section>

          <Section>
            <H2>第15条 その他</H2>
            <P>
              本規約のいずれかの条項が無効または執行不能と判断された場合でも、残りの条項は引き続き有効とします。また、権利の不行使は権利放棄を意味しません。本規約は、お客様と運営との間の本サービスに関する完全な合意を構成し、これに先立つ一切の合意に優先します。
            </P>
          </Section>
        </section>

        <div className="text-sm text-slate-600">
          <Link href={t('link', { href: '/' })} className="underline underline-offset-2 hover:text-slate-900">
            {t('legal:back-to-top')}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default wrapPage(TermsPage);
