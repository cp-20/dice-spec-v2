'use client';

import type { FC, ReactNode } from 'react';

import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { round } from '@/shared/lib/round';
import { cn } from '@/shared/lib/shadcn-utils';

import type { DistributionResult } from '../hooks/systemSpecificExpecter';

export const percent = (value: number) => round(value * 100, 1);

export const detailedPercent = (value: number) => {
  const percentage = value * 100;
  if (percentage < 0.1) return round(percentage, 3);
  if (percentage < 1) return round(percentage, 2);
  return round(percentage, 1);
};

export const NumberField: FC<{
  label: string;
  value: number;
  min?: number;
  max?: number;
  className?: string;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, className, onChange }) => (
  <div className="space-y-2">
    <Label className="text-sm font-bold text-slate-600">{label}</Label>
    <Input
      className={`w-32 ${className ?? ''}`}
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  </div>
);

export const BonusPenaltySelect: FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  fullWidth?: boolean;
}> = ({ label, value, onChange, fullWidth }) => (
  <div className={cn('space-y-2', fullWidth && 'w-full')}>
    <Label className="text-sm font-bold text-slate-600">{label}</Label>
    <Select value={String(value)} onValueChange={(nextValue) => onChange(Number(nextValue))}>
      <SelectTrigger className={cn(fullWidth ? 'w-full' : 'w-32')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="2">ボーナス2</SelectItem>
        <SelectItem value="1">ボーナス1</SelectItem>
        <SelectItem value="0">なし</SelectItem>
        <SelectItem value="-1">ペナルティ1</SelectItem>
        <SelectItem value="-2">ペナルティ2</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

export const SystemPanel: FC<{
  title: string;
  description: string;
  controls: ReactNode;
  result?: DistributionResult;
  stats?: ReactNode;
  children?: ReactNode;
}> = ({ title, description, controls, result, stats, children }) => (
  <section className="space-y-5 rounded-md border p-4">
    <div className="space-y-1">
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      <p className="text-sm leading-6 text-slate-600">{description}</p>
    </div>

    {controls}

    {stats}

    {children ?? (result && <ProbabilityBars result={result} />)}
  </section>
);

export const ProbabilityBars: FC<{
  result: DistributionResult;
  formatPercent?: (value: number) => number;
}> = ({ result, formatPercent = percent }) => {
  const maxProbability = Math.max(...result.rows.map((row) => row.probability), 0);

  return (
    <div className="space-y-2">
      {result.rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[minmax(7rem,12rem)_1fr_4.5rem] items-center gap-3 text-sm">
          <div className="truncate font-medium text-slate-700">{row.label}</div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-600"
              style={{ width: `${maxProbability === 0 ? 0 : (row.probability / maxProbability) * 100}%` }}
            />
          </div>
          <div className="text-right tabular-nums text-slate-600">{formatPercent(row.probability)}%</div>
        </div>
      ))}
    </div>
  );
};

export const OpposedProbabilityBar: FC<{
  activeLabel: string;
  passiveLabel: string;
  activeProbability: number;
  passiveProbability: number;
  drawProbability?: number;
}> = ({ activeLabel, passiveLabel, activeProbability, passiveProbability, drawProbability = 0 }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3 text-sm font-bold">
      <div className="text-blue-700">{activeLabel}</div>
      <div className="text-right text-red-700">{passiveLabel}</div>
    </div>

    <div className="flex h-9 overflow-hidden bg-slate-100">
      <div
        className="flex items-center justify-start bg-blue-200 px-2 text-xs font-bold text-blue-900 border border-blue-300 border-r-0 rounded-l-md"
        style={{ width: `${activeProbability * 100}%` }}
      >
        {activeProbability > 0.08 && `${activeLabel} ${percent(activeProbability)}%`}
      </div>
      {drawProbability > 0 && (
        <div
          className="flex items-center justify-center bg-slate-200 px-2 text-xs font-bold text-slate-700 border border-slate-300 border-x-0"
          style={{ width: `${drawProbability * 100}%` }}
        >
          {drawProbability > 0.08 && `引き分け ${percent(drawProbability)}%`}
        </div>
      )}
      <div
        className="flex items-center justify-end bg-red-200 px-2 text-xs font-bold text-red-900 border border-red-300 border-l-0 rounded-r-md"
        style={{ width: `${passiveProbability * 100}%` }}
      >
        {passiveProbability > 0.08 && `${passiveLabel} ${percent(passiveProbability)}%`}
      </div>
    </div>
  </div>
);
