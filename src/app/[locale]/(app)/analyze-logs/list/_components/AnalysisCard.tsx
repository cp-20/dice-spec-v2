import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import type { FC } from 'react';
import { CustomLink } from '@/shared/components/elements/CustomLink';
import { UserAvatar } from '@/shared/components/elements/UserAvatar';
import type { AnalysisDocument } from '@/shared/lib/firebase/stores/collections';
import { round } from '@/shared/lib/round';
import { ALL_CHARACTER_ID } from '../../_components/constants';
import { selectedCharacterIdAtom } from './atoms';
import { systems } from '../../_components/hooks/ccfoliaLogAnalysis/messageParser';
import { invariant } from '@/shared/lib/invariant';

interface AnalysisCardProps {
  analysis: AnalysisDocument;
}

export const AnalysisCard: FC<AnalysisCardProps> = ({ analysis }) => {
  const selectedCharacterId = useAtomValue(selectedCharacterIdAtom);

  const systemName = systems[analysis.systemId].name;
  const results = analysis.characterResults;
  const selectedCharacter =
    results.find((c) => c.id === selectedCharacterId) ?? results.find((c) => c.id === ALL_CHARACTER_ID);
  invariant(selectedCharacter !== undefined, 'Selected character not found in analysis results');

  const deviationScore = round(selectedCharacter.summary.deviationScore, 1);

  return (
    <CustomLink href={t('link', { href: `/analyze-logs/${analysis.id}` })}>
      <div className="rounded-md border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:bg-slate-50">
        <div className="flex items-stretch gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h3 className="line-clamp-1 text-lg font-semibold text-slate-900">{analysis.title}</h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <span>{systemName}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div>
                {analysis.sessionDate
                  .toDate()
                  .toLocaleDateString(t('date-locale'), { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>

              <div className="flex items-center gap-1.5">
                <UserAvatar uid={analysis.ownerUid} size={16} />
                <span>{analysis.owner.name}</span>
              </div>
            </div>
          </div>

          <div className="flex w-24 shrink-0 flex-col items-end justify-center text-right">
            <div className="text-[10px] leading-none text-slate-500">{t('analyze-logs:list.card.deviation-score')}</div>
            <div className="mt-1 text-4xl font-bold leading-none tracking-tight text-slate-900">{deviationScore}</div>
          </div>
        </div>
      </div>
    </CustomLink>
  );
};
