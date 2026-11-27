import { CustomLink } from '@/shared/components/elements/CustomLink';

const examples = [
  { command: '1D6', meaning: '6面ダイスを1個', range: '1–6', usage: '汎用' },
  { command: '2D6', meaning: '6面ダイスを2個', range: '2–12', usage: 'ソード・ワールド2.5、シノビガミの判定' },
  { command: '3D6', meaning: '6面ダイスを3個', range: '3–18', usage: 'クトゥルフ神話TRPGの能力値' },
  { command: '1D10', meaning: '10面ダイスを1個', range: '1–10', usage: 'ダメージなど' },
  { command: '1D20', meaning: '20面ダイスを1個', range: '1–20', usage: 'D&Dの判定' },
  { command: '1D100', meaning: '100面ダイスを1個', range: '1–100', usage: 'クトゥルフ神話TRPGの技能判定' },
];

export const DiceRollGuide = () => (
  <details className="border-t pt-4">
    <summary className="cursor-pointer font-medium">ダイスの書き方と使い方</summary>
    <div className="mt-4 space-y-4 text-sm">
      <p>「xDy」はy面ダイスをx個振って合計する書き方です。</p>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th scope="col" className="py-3 pr-4">
              ダイス式
            </th>
            <th scope="col" className="py-3 pr-4">
              意味
            </th>
            <th scope="col" className="py-3 pr-4">
              出目の範囲
            </th>
            <th scope="col" className="py-3">
              主な用途
            </th>
          </tr>
        </thead>
        <tbody>
          {examples.map(({ command, meaning, range, usage }) => (
            <tr key={command} className="border-b">
              <th scope="row" className="py-2 pr-4 font-mono">
                {command}
              </th>
              <td className="py-2 pr-4">{meaning}</td>
              <td className="py-2 pr-4 tabular-nums">{range}</td>
              <td className="py-2">{usage}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        アドバンスドモードでは、ゲームシステムを選んで固有の判定を振れます。たとえばクトゥルフ神話TRPG(6版)は
        <code className="font-mono">CCB&lt;=50</code>、新クトゥルフ神話TRPG(7版)は
        <code className="font-mono">CC&lt;=50</code>
        と入力します。
      </p>
      <p>
        振る前に成功率や期待値を知りたいときは
        <CustomLink href="/expect" className="underline underline-offset-2">
          ダイス予測
        </CustomLink>
        で計算できます。
      </p>
    </div>
  </details>
);
