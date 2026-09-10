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
  <section className="space-y-6" aria-labelledby="expectation-guide-title">
    <h2 id="expectation-guide-title" className="text-2xl font-bold">
      {t('expect:guide.title')}
    </h2>
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
    <div className="space-y-3">
      <h3 className="text-xl font-bold">{t('expect:guide.3d6-title')}</h3>
      <p>{t('expect:guide.3d6-description')}</p>
      <p>{t('expect:guide.3d6-distribution')}</p>
      <p>{t('expect:guide.3d6-compare')}</p>
      <ExampleCommandButton command="3d6>=11" />
    </div>
  </section>
);
