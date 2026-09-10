import { t } from 'i18next';

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
    <summary className="cursor-pointer font-medium">{t('expect:guide.title')}</summary>
    <div className="mt-4 space-y-4 text-sm">
      <p>{t('expect:guide.introduction')}</p>
      <table className="w-full text-left text-sm tabular-nums">
        <thead>
          <tr className="border-b">
            <th scope="col" className="py-3 pr-4">
              {t('expect:guide.command')}
            </th>
            <th scope="col" className="py-3 pr-4">
              {t('expect:guide.mean')}
            </th>
            <th scope="col" className="py-3">
              {t('expect:guide.range')}
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
      <p>{t('expect:guide.formula')}</p>
    </div>
  </details>
);
