'use client';

import { IconChevronRight, IconList, IconLoader2, IconLock, IconLockOpen, IconSparkles } from '@tabler/icons-react';
import { Timestamp } from 'firebase/firestore';
import { useAtomValue } from 'jotai';
import { useRouter } from 'next/navigation';
import type { FC } from 'react';
import { useState } from 'react';

import { ContainerSection } from '@/app/(app)/_components/ContainerSection';
import { useMeStore } from '@/features/account/firebase/accountStore';
import { type SaveAnalysisPayload, useSaveAnalysis } from '@/features/log-analysis/firebase/mutations';
import type { AnalysisVisibilityLevel } from '@/features/log-analysis/firebase/schema';
import { myAnalysesAtom, useUserAnalyses } from '@/features/log-analysis/firebase/userAnalyses';
import { CustomLink } from '@/shared/components/elements/CustomLink';
import { GoogleSignInAgreement } from '@/shared/components/elements/GoogleSignInAgreement';
import { GoogleSignInButton } from '@/shared/components/elements/GoogleSignInButton';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useToast } from '@/shared/components/ui/use-toast';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';
import { captureClientException } from '@/shared/lib/sentryClient';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

import { useAnalysisOgImage } from './hooks/useAnalysisOgImage';
import { useLogAnalysis } from './hooks/useLogAnalysis';

const SAVE_ANALYSIS_LIMIT_FREE = 3;

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AnalysisSavePanel: FC = () => {
  const visibilityOptions: Array<{ value: AnalysisVisibilityLevel; label: string; icon: typeof IconLock }> = [
    { value: 'private', label: '非公開', icon: IconLock },
    { value: 'unlisted', label: '限定公開', icon: IconSparkles },
    { value: 'public', label: '公開', icon: IconLockOpen },
  ];

  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { authUser } = useFirebaseAuth();
  const { system, result } = useLogAnalysis();
  const { generateOgImage } = useAnalysisOgImage();
  const { saveAnalysis } = useSaveAnalysis(generateOgImage);
  useUserAnalyses(authUser?.uid);
  const analyses = useAtomValue(myAnalysesAtom);
  const { me } = useMeStore();
  const { sendEvent } = useGoogleAnalytics();

  const [visibility, setVisibility] = useState<AnalysisVisibilityLevel>('private');
  const [title, setTitle] = useState('');
  const [showRecordDetails, setShowRecordDetails] = useState(true);
  const [sessionDate, setSessionDate] = useState(formatDate(new Date()));

  const isPro = me?.plan === 'pro';
  const limitReached = !isPro && analyses.length >= SAVE_ANALYSIS_LIMIT_FREE;

  const canSave =
    authUser !== null &&
    me !== null &&
    result?.type === 'success' &&
    system !== null &&
    !limitReached &&
    !saving &&
    title.trim() !== '';

  const handleSave = async () => {
    if (!canSave) return;

    setSaving(true);

    try {
      const payload: SaveAnalysisPayload = {
        title: title.trim(),
        ownerUid: authUser.uid,
        owner: {
          id: me.id,
          name: me.name,
          ...(me.avatarUrl === undefined ? {} : { avatarUrl: me.avatarUrl }),
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
      sendEvent('save_analysis', {
        visibility,
        show_record_details: showRecordDetails,
        plan: me.plan,
      });
      router.push(`/analyze-logs/${analysisId}`);
    } catch (err) {
      console.error(err);
      if (Number.isNaN(new Date(sessionDate).getTime())) {
        sendEvent('save_analysis_error', { reason: 'invalid_date' });
      } else {
        captureClientException(err);
      }
      toast({
        title: '保存に失敗しました',
        description: '保存中にエラーが発生しました。時間をおいて再度お試しください。',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContainerSection label="保存と公開" className="space-y-4">
      {!authUser ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <p className="text-sm text-slate-600 text-center">保存するにはログインが必要です</p>
          <div className="flex flex-col gap-2 items-center">
            <GoogleSignInButton size="md" />
            <GoogleSignInAgreement />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid gap-3 lg:grid-cols-[1fr_200px_150px]">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500">タイトル</div>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="シナリオ名など" />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500">公開範囲</div>
              <Select value={visibility} onValueChange={(value) => setVisibility(value as AnalysisVisibilityLevel)}>
                <SelectTrigger>
                  <SelectValue placeholder="公開範囲" />
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
              <div className="text-xs font-semibold text-slate-500">セッション日</div>
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
              ダイスログを公開する
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {!isPro &&
                `フリープランでは最大${SAVE_ANALYSIS_LIMIT_FREE}件まで保存できます (現在${analyses.length}件保存中)`}
            </div>
            <Button onClick={handleSave} disabled={!canSave}>
              {saving ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" />
                  <span>保存中</span>
                </>
              ) : (
                '保存する'
              )}
            </Button>
          </div>

          <CustomLink href="/analyze-logs/list">
            <Button variant="outline" className="w-full">
              <IconList className="size-4" />
              <span>保存した解析結果の一覧を見る</span>
              <IconChevronRight className="size-4" />
            </Button>
          </CustomLink>

          {limitReached && (
            <div className="rounded-md border border-blue-200 bg-blue-50/50 p-4 space-y-3 mt-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-800">保存件数の上限に達しました</p>
                <p className="text-xs text-blue-800">
                  プロプランにアップグレードすると無制限に保存できるようになります
                </p>
              </div>
              <CustomLink href="/profile">
                <Button
                  variant="default"
                  className="w-full border border-blue-400 bg-blue-100 text-blue-700 hover:border-blue-500 hover:bg-blue-200 hover:text-blue-800"
                >
                  <IconSparkles className="size-4" />
                  <span>プロプランにアップグレード</span>
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
