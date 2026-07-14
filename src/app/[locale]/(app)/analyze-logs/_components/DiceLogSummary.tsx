'use client';

import { t } from 'i18next';
import { CheckCircle2, ChevronRight, Lock, Sparkles } from 'lucide-react';
import type { FC } from 'react';

import { ContainerSection } from '@/app/[locale]/(app)/_components/ContainerSection';
import { CustomLink } from '@/shared/components/elements/CustomLink';
import { Button } from '@/shared/components/ui/button';
import { useMeStore } from '@/features/account/firebase/accountStore';
import { round } from '@/shared/lib/round';

import { useCharacterLogAnalysis } from './hooks/useCharacterLogAnalysis';
import { useCharacterSelect } from './hooks/useCharacterSelect';

const PREVIEW_ROW_COUNT = 4;

type LogResult = {
  evaluationStatus: 'success' | 'failure' | 'other';
  skillName: string | null;
  target: number;
};

type SkillSummary = {
  skillName: string;
  minTarget: number;
  maxTarget: number;
  rollCount: number;
  successCount: number;
  failureCount: number;
  successRate: number;
};

const summarizeBySkill = (results: LogResult[]): SkillSummary[] => {
  const map = new Map<string, Omit<SkillSummary, 'successRate'>>();
  const untaggedSkillName = t('analyze-logs:skill-summary.untagged');

  for (const result of results) {
    const skillName = result.skillName ?? untaggedSkillName;
    const key = skillName;
    const current = map.get(key);

    if (current === undefined) {
      map.set(key, {
        skillName,
        minTarget: result.target,
        maxTarget: result.target,
        rollCount: 1,
        successCount: result.evaluationStatus === 'success' ? 1 : 0,
        failureCount: result.evaluationStatus === 'failure' ? 1 : 0,
      });
      continue;
    }

    current.minTarget = Math.min(current.minTarget, result.target);
    current.maxTarget = Math.max(current.maxTarget, result.target);
    current.rollCount += 1;
    if (result.evaluationStatus === 'success') current.successCount += 1;
    if (result.evaluationStatus === 'failure') current.failureCount += 1;
  }

  return Array.from(map.values())
    .map((summary) => {
      const successOrFailureCount = summary.successCount + summary.failureCount;
      return {
        ...summary,
        successRate: successOrFailureCount > 0 ? (summary.successCount / successOrFailureCount) * 100 : 0,
      };
    })
    .sort((a, b) => {
      if (a.rollCount !== b.rollCount) return b.rollCount - a.rollCount;
      if (a.successRate !== b.successRate) return b.successRate - a.successRate;
      return a.skillName.localeCompare(b.skillName, 'ja');
    });
};

const formatTargetRange = (minTarget: number, maxTarget: number) => {
  if (minTarget === maxTarget) return `${minTarget}`;
  return `${minTarget}-${maxTarget}`;
};

interface DiceLogSummaryViewProps {
  results?: LogResult[];
}

export const DiceLogSummaryView: FC<DiceLogSummaryViewProps> = ({ results }) => {
  const { me } = useMeStore();
  const isPro = me?.plan === 'pro';

  const summaries = results ? summarizeBySkill(results) : [];
  const visibleSummaries = isPro ? summaries : summaries.slice(0, PREVIEW_ROW_COUNT);
  const paywallEnabled = !isPro && summaries.length > 0;

  return (
    <ContainerSection label={t('analyze-logs:skill-summary.label')}>
      {summaries.length > 0 ? (
        <div>
          <div className="relative">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="text-left py-2 pr-4 font-medium">{t('analyze-logs:skill-summary.skill')}</th>
                    <th className="text-right py-2 px-2 font-medium">{t('analyze-logs:skill-summary.target')}</th>
                    <th className="text-right py-2 pl-2 font-medium">{t('analyze-logs:skill-summary.success-rate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSummaries.map((summary) => (
                    <tr key={summary.skillName} className="border-b border-slate-100 last:border-b-0">
                      <td className="py-2 pr-4 text-slate-900">
                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            className={summary.successCount > 0 ? 'size-4 text-emerald-600' : 'size-4 text-slate-300'}
                            aria-hidden
                          />
                          <span>{summary.skillName}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-right tabular-nums text-slate-700">
                        {formatTargetRange(summary.minTarget, summary.maxTarget)}
                      </td>
                      <td className="py-2 pl-2 text-right tabular-nums text-lg font-semibold text-slate-900">
                        {round(summary.successRate, 1)}%{' '}
                        <span className="text-xs font-normal text-slate-500">
                          ({summary.successCount}/{summary.rollCount})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {paywallEnabled && (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-white/0 via-white/85 to-white"
                aria-hidden
              />
            )}

            {paywallEnabled && (
              <div className="absolute inset-x-0 bottom-0 z-10 px-3 pb-3">
                <div className="mx-auto max-w-xl rounded-md border border-blue-200 bg-blue-50/95 p-4 space-y-3 shadow-sm backdrop-blur-[1px]">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-blue-800 flex items-center gap-1.5">
                      <Lock className="size-4" />
                      <span>{t('analyze-logs:skill-summary.paywall.title')}</span>
                    </p>
                  </div>
                  <CustomLink href={t('link', { href: '/profile' })}>
                    <Button
                      variant="default"
                      className="w-full border border-blue-400 bg-blue-100 text-blue-700 hover:border-blue-500 hover:bg-blue-200 hover:text-blue-800"
                    >
                      <Sparkles className="size-4" />
                      <span>{t('analyze-logs:skill-summary.paywall.cta')}</span>
                      <ChevronRight className="size-4" />
                    </Button>
                  </CustomLink>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-sm text-slate-500">{t('analyze-logs:skill-summary.no-data')}</div>
      )}
    </ContainerSection>
  );
};

export const DiceLogSummary: FC = () => {
  const { character } = useCharacterSelect();
  const result = useCharacterLogAnalysis(character);

  return <DiceLogSummaryView results={result?.results} />;
};
