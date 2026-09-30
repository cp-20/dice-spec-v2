import Link from 'next/link';

export const LogAnalysisGuide = () => (
  <details className="text-sm">
    <summary className="cursor-pointer font-medium">詳しい使い方を見る</summary>
    <div className="mt-4 space-y-4 text-sm">
      <ol className="list-decimal space-y-2 pl-6">
        <li>ココフォリアのルームでログ出力を開き、HTML形式のログを保存します。</li>
        <li>このページでHTMLログを選択するか、ドラッグ＆ドロップします。</li>
        <li>タブ・ゲームシステム・キャラクターを選んで集計結果を確認します。</li>
      </ol>
      <div className="space-y-3">
        <h3 className="font-medium">対応するゲームシステム</h3>
        <p>
          クトゥルフ神話TRPG(6版)、新クトゥルフ神話TRPG(7版)、エモクロアTRPG、シノビガミ、ネクロニカ、ソード・ワールド2.5に対応しています。
        </p>
      </div>
      <div className="space-y-3">
        <p>成功率は、ログ内で成功・失敗を判定できるロールの実績です。</p>
        <Link href="/expect" className="underline underline-offset-4">
          これから振るダイスの確率・期待値を計算する
        </Link>
      </div>
    </div>
  </details>
);
