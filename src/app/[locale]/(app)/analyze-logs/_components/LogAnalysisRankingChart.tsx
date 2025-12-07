'use client';

import { t } from 'i18next';
import type { FC } from 'react';
import { calcNormalCDF, calcNormalDistribution } from '@/shared/lib/normalDistribution';
import { useCharacterLogAnalysis } from './hooks/useCharacterLogAnalysis';
import { useCharacterSelect } from './hooks/useCharacterSelect';

const mean = 50;
const sd = 10;

export const LogAnalysisRankingChart: FC = () => {
  const { character } = useCharacterSelect();
  const result = useCharacterLogAnalysis(character);

  const score = result ? result.summary.deviationScore : 0;
  const percentage = score && (1 - calcNormalCDF(score, mean, sd)) * 100;

  return (
    <div>
      <Chart score={score} />
      <Counter percentage={percentage} />
    </div>
  );
};

interface CounterProps {
  percentage: number;
}

const Counter: FC<CounterProps> = ({ percentage }) => {
  return (
    <div className="text-center">
      <span className="text mr-1 text-gray-500">{t('analyze-logs:chart.top')}</span>
      <span className="text-2xl font-bold">{percentage.toFixed(1)}</span>
      <span className="text-sm text-gray-500">%</span>
    </div>
  );
};

interface ChartProps {
  score: number;
}

const width = 480;
const height = 300;
const padding = 20;
const domainMin = 20;
const domainMax = 80;
const samples = 480;

const pdf = (x: number) => calcNormalDistribution(x, mean, sd);

const xs = Array.from({ length: samples + 1 }, (_, i) => domainMin + ((domainMax - domainMin) * i) / samples);
const ys = xs.map(pdf);
const maxY = Math.max(...ys);
const baselineY = height - padding;

const scaleX = (x: number) => padding + ((x - domainMin) / (domainMax - domainMin)) * (width - padding * 2);
const scaleY = (y: number) => baselineY - (y / maxY) * (height - padding * 7);

const curvePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(x)} ${scaleY(pdf(x))}`).join(' ');

const makeAreaPath = (segment: number[]) => {
  if (segment.length < 2) return '';
  const top = segment.map((x) => `${scaleX(x)},${scaleY(pdf(x))}`).join(' ');
  const last = segment[segment.length - 1];
  const first = segment[0];
  return `M ${top} L ${scaleX(last)},${baselineY} L ${scaleX(first)},${baselineY} Z`;
};

const areaAll = makeAreaPath(xs);

const Chart: FC<ChartProps> = ({ score }) => {
  const scoreX = scaleX(Math.max(domainMin, Math.min(domainMax, score)));
  const leftWidth = Math.max(0, scoreX - padding);
  const rightWidth = Math.max(0, width - padding - scoreX);
  const percentage = score && (1 - calcNormalCDF(score, mean, sd)) * 100;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`score = ${score}`}>
      <defs>
        <clipPath id="pdfClip" clipPathUnits="userSpaceOnUse">
          <path d={areaAll} />
        </clipPath>
      </defs>

      <line x1={padding} x2={width - padding} y1={baselineY} y2={baselineY} stroke="#e5e7eb" strokeWidth={1} />

      <rect
        x={padding}
        y={0}
        width={leftWidth}
        height={height}
        fill="#334155"
        fillOpacity={0.5}
        clipPath="url(#pdfClip)"
        style={{
          transition: 'width 800ms cubic-bezier(.2,.8,.2,1)',
        }}
      />
      <rect
        x={scoreX}
        y={0}
        width={rightWidth}
        height={height}
        fill="#64748b"
        fillOpacity={0.2}
        clipPath="url(#pdfClip)"
        style={{
          transition: 'x 800ms cubic-bezier(.2,.8,.2,1), width 800ms cubic-bezier(.2,.8,.2,1)',
        }}
      />

      {/* PDF curve */}
      <path d={curvePath} fill="none" stroke="#11182777" strokeWidth={1} />

      <g
        style={{
          transform: `translate(${scoreX}px)`,
          transition: 'transform 800ms cubic-bezier(.2,.8,.2,1)',
        }}
      >
        <line x1={0} x2={0} y1={padding * 5} y2={baselineY} stroke="#111827" strokeWidth={2} />
        <polygon
          points={`${-6},${padding * 5} ${6},${padding * 5} 0,${padding * 5 + 8}`}
          fill="#111827"
          stroke="#ffffffaa"
          strokeWidth={0}
        />
        <text x={0} y={padding * 5 - 12} textAnchor="middle" fill="#111827">
          <tspan fontSize={48} fontWeight="bold">
            {percentage.toFixed(1)}
          </tspan>

          <tspan fontSize={16} fontWeight="normal">
            {' '}
            %
          </tspan>
        </text>
      </g>

      {/* ticks and labels */}
      <g fill="#6b7280" fontSize={10} fontFamily="sans-serif" textAnchor="middle">
        {[20, 35, 50, 65, 80].map((t) => (
          <g key={t}>
            <line
              x1={scaleX(t)}
              x2={scaleX(t)}
              y1={baselineY}
              y2={scaleY(pdf(t)) + 1}
              stroke="#ffffff"
              strokeWidth={1}
            />
            <text x={scaleX(t)} y={baselineY + 12} fontSize={10}>
              {t}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
};
