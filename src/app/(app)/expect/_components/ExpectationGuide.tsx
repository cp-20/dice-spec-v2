import { ExampleCommandButton } from './ExampleCommandButton';

const examples = [
  { command: '1d6', mean: 3.5, min: 1, max: 6 },
  { command: '2d6', mean: 7, min: 2, max: 12 },
  { command: '3d6', mean: 10.5, min: 3, max: 18 },
  { command: '4d6', mean: 14, min: 4, max: 24 },
  { command: '5d6', mean: 17.5, min: 5, max: 30 },
  { command: '6d6', mean: 21, min: 6, max: 36 },
  { command: '2d10', mean: 11, min: 2, max: 20 },
  { command: '3d10', mean: 16.5, min: 3, max: 30 },
];

export const ExpectationGuide = () => (
  <details className="border-t pt-4">
    <summary className="cursor-pointer font-medium">ダイス・サイコロの期待値一覧</summary>
    <div className="mt-4 space-y-4 text-sm">
      <p>ダイス式を押すと期待値と確率分布を計算できます。</p>
      <table className="w-full text-left text-sm tabular-nums">
        <thead>
          <tr className="border-b">
            <th scope="col" className="py-3 pr-4">
              ダイス式
            </th>
            <th scope="col" className="py-3 pr-4">
              期待値
            </th>
            <th scope="col" className="py-3">
              出目の範囲
            </th>
          </tr>
        </thead>
        <tbody>
          {examples.map(({ command, mean, min, max }) => (
            <tr key={command} className="border-b">
              <th scope="row" className="pr-4">
                <ExampleCommandButton command={command} />
              </th>
              <td className="py-2 pr-4">{mean}</td>
              <td className="py-2">
                {min}–{max}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>公平なn個のm面ダイス(ndm)の期待値は n × (m + 1) ÷ 2。固定値はそのまま加算します。</p>
    </div>
  </details>
);
