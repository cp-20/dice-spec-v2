import { IconChevronLeft, IconEdit, IconTimeline, IconTrash } from '@tabler/icons-react';
import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import type { FC } from 'react';

import { PageTitle } from '@/app/[locale]/(app)/_components/PageTitle';
import { CustomLink } from '@/shared/components/elements/CustomLink';
import { UserAvatar } from '@/shared/components/elements/UserAvatar';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';

import { currentAnalysisAtom, isOwnerAtom, systemNameAtom } from './atoms';
import { useDeleteAnalysisDialog } from './useDeleteAnalysisDialog';
import { useEditAnalysisDialog } from './useEditAnalysisDialog';

export const AnalysisHeader: FC = () => {
  const { analysis, loading } = useAtomValue(currentAnalysisAtom);
  const isOwner = useAtomValue(isOwnerAtom);
  const systemName = useAtomValue(systemNameAtom);
  const editDialog = useEditAnalysisDialog();
  const deleteDialog = useDeleteAnalysisDialog();

  return (
    <div className="space-y-2">
      {editDialog.render()}
      {deleteDialog.render()}

      <div>
        <CustomLink href={t('link', { href: '/analyze-logs/list' })}>
          <span className="inline-flex items-center gap-2 text-sm text-slate-500 hover:underline">
            <IconChevronLeft className="size-4" />
            {t('analyze-logs:detail.back-to-list')}
          </span>
        </CustomLink>
      </div>
      <div className="flex items-center justify-between gap-4">
        {loading ? (
          <div className="flex-1 space-y-2">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        ) : (
          analysis && (
            <>
              <div className="flex-1 space-y-2">
                <PageTitle icon={IconTimeline}>{analysis.title}</PageTitle>
                <div className="text-sm text-slate-600">{systemName}</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 pt-2">
                  <UserAvatar uid={analysis.ownerUid} size={24} />
                  <span>{analysis.owner.name}</span>
                </div>
              </div>

              {isOwner && (
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={editDialog.open}>
                    <IconEdit className="size-4" />
                    {t('analyze-logs:detail.edit')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={deleteDialog.open}>
                    <IconTrash className="size-4" />
                    {t('analyze-logs:detail.delete')}
                  </Button>
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
};
