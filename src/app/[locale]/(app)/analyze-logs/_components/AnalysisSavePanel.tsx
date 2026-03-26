'use client';

import { IconChevronRight, IconList, IconLoader2, IconLock, IconLockOpen, IconSparkles } from '@tabler/icons-react';
import { Timestamp } from 'firebase/firestore';
import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import { useRouter } from 'next/navigation';
import type { FC } from 'react';
import { useState } from 'react';
import { ContainerSection } from '@/app/[locale]/(app)/_components/ContainerSection';
import { CustomLink } from '@/shared/components/elements/CustomLink';
import { GoogleSignInAgreement } from '@/shared/components/elements/GoogleSignInAgreement';
import { GoogleSignInButton } from '@/shared/components/elements/GoogleSignInButton';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useToast } from '@/shared/components/ui/use-toast';
import { type SaveAnalysisPayload, useSaveAnalysis } from '@/shared/lib/firebase/stores/analyses/mutations';
import { myAnalysesAtom, useUserAnalyses } from '@/shared/lib/firebase/stores/analyses/userAnalyses';
import type { AnalysisVisibilityLevel } from '@/shared/lib/firebase/stores/collections';
import { useMeStore } from '@/shared/lib/firebase/stores/userStore';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';
import { useLogAnalysis } from './hooks/useLogAnalysis';

export const SAVE_ANALYSIS_LIMIT_FREE = 3;

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AnalysisSavePanel: FC = () => {
  const visibilityOptions: Array<{ value: AnalysisVisibilityLevel; label: string; icon: typeof IconLock }> = [
    { value: 'private', label: t('analyze-logs:save.visibility.private'), icon: IconLock },
    { value: 'unlisted', label: t('analyze-logs:save.visibility.unlisted'), icon: IconSparkles },
    { value: 'public', label: t('analyze-logs:save.visibility.public'), icon: IconLockOpen },
  ];

  const router = useRouter();
  const { toast } = useToast();
  const { authUser } = useFirebaseAuth();
  const { system, result } = useLogAnalysis();
  const { saveAnalysis, saving } = useSaveAnalysis();
  useUserAnalyses(authUser?.uid);
  const analyses = useAtomValue(myAnalysesAtom);
  const { me } = useMeStore();

  const [visibility, setVisibility] = useState<AnalysisVisibilityLevel>('private');
  const [title, setTitle] = useState('');
  const [showRecordDetails, setShowRecordDetails] = useState(true);
  const [sessionDate, setSessionDate] = useState(formatDate(new Date()));

  const isPro = me.plan === 'pro';
  const limitReached = !isPro && analyses.length >= SAVE_ANALYSIS_LIMIT_FREE;

  const canSave =
    authUser !== null &&
    result?.type === 'success' &&
    system !== null &&
    !limitReached &&
    !saving &&
    title.trim() !== '';

  const handleSave = async () => {
    if (!canSave) return;

    try {
      const payload: SaveAnalysisPayload = {
        title: title.trim(),
        ownerUid: authUser.uid,
        owner: {
          id: me.id,
          name: me.name,
          avatarUrl: me.avatarUrl,
          plan: me.plan,
          createdAt: me.createdAt,
          updatedAt: me.updatedAt,
        },
        systemId: system,
        showRecordDetails,
        characterResults: result.results,
        visibilityLevel: visibility,
        sessionDate: Timestamp.fromDate(new Date(sessionDate)),
      };

      const analysisId = await saveAnalysis(payload);
      router.push(t('link', { href: `/analyze-logs/${analysisId}` }));
    } catch (err) {
      console.error(err);
      toast({
        title: t('analyze-logs:save.failed.title'),
        description: t('analyze-logs:save.failed.description'),
        variant: 'destructive',
      });
    }
  };

  return (
    <ContainerSection label={t('analyze-logs:save.title')} className="space-y-4">
      {!authUser ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <p className="text-sm text-slate-600 text-center">{t('analyze-logs:save.sign-in-required')}</p>
          <div className="flex flex-col gap-2 items-center">
            <GoogleSignInButton size="md" />
            <GoogleSignInAgreement />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid gap-3 lg:grid-cols-[1fr_200px_150px]">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500">{t('analyze-logs:save.title-label')}</div>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={t('analyze-logs:save.title-placeholder')}
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500">{t('analyze-logs:save.visibility.label')}</div>
              <Select value={visibility} onValueChange={(value) => setVisibility(value as AnalysisVisibilityLevel)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('analyze-logs:save.visibility.label')} />
                </SelectTrigger>
                <SelectContent>
                  {visibilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="inline-flex items-center gap-2">
                        <option.icon className="size-4" />
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500">{t('analyze-logs:save.session-date-label')}</div>
              <Input type="date" value={sessionDate} onChange={(event) => setSessionDate(event.target.value)} />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="showRecordDetails"
              checked={showRecordDetails}
              onCheckedChange={(checked) => setShowRecordDetails(checked === true)}
            />
            <label
              htmlFor="showRecordDetails"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {t('analyze-logs:save.show-record-details-label')}
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {!isPro && t('analyze-logs:save.limit-free', { count: analyses.length, limit: SAVE_ANALYSIS_LIMIT_FREE })}
            </div>
            <Button onClick={handleSave} disabled={!canSave}>
              {saving ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" />
                  <span>{t('analyze-logs:save.saving')}</span>
                </>
              ) : (
                t('analyze-logs:save.save-button')
              )}
            </Button>
          </div>

          <CustomLink href={t('link', { href: '/analyze-logs/list' })}>
            <Button variant="outline" className="w-full">
              <IconList className="size-4" />
              <span>{t('analyze-logs:save.go-to-list')}</span>
              <IconChevronRight className="size-4" />
            </Button>
          </CustomLink>

          {limitReached && (
            <div className="rounded-md border border-blue-200 bg-blue-50/50 p-4 space-y-3 mt-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-800">{t('analyze-logs:save.limit-reached-message')}</p>
                <p className="text-xs text-blue-800">{t('analyze-logs:save.upgrade-to-pro')}</p>
              </div>
              <CustomLink href="/profile">
                <Button
                  variant="default"
                  className="w-full border border-blue-400 bg-blue-100 text-blue-700 hover:border-blue-500 hover:bg-blue-200 hover:text-blue-800"
                >
                  <IconSparkles className="size-4" />
                  <span>{t('analyze-logs:save.upgrade-button')}</span>
                  <IconChevronRight className="size-4" />
                </Button>
              </CustomLink>
            </div>
          )}
        </div>
      )}
    </ContainerSection>
  );
};
