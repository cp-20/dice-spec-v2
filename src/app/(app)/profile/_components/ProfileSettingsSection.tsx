'use client';

import { IconLoader2, IconPhotoUp } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';

import { ContainerSection } from '@/app/(app)/_components/ContainerSection';
import { useDropzone } from '@/app/(app)/analyze-logs/_components/hooks/useDropzone';
import { useMeStore } from '@/features/account/firebase/accountStore';
import { useProfileMutations } from '@/features/profile/useProfileMutations';
import { UserAvatar } from '@/shared/components/elements/UserAvatar';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/components/ui/use-toast';
import { getFirebaseStorage } from '@/shared/lib/firebase/client';
import { AvatarPreparationError, uploadAvatarFromFileToStorage } from '@/shared/lib/firebase/storage/avatars';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';
import { captureClientException } from '@/shared/lib/sentryClient';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

export const ProfileSettingsSection = () => {
  const storage = getFirebaseStorage();
  const { authUser } = useFirebaseAuth();
  const { me, meLoading } = useMeStore();
  const { updateName, updateAvatarUrl } = useProfileMutations();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const { sendEvent } = useGoogleAnalytics();

  useEffect(() => {
    setDisplayName(me?.name ?? '');
  }, [me?.name]);

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (authUser?.uid === undefined) return;
      setUploading(true);

      try {
        const avatarUrl = await uploadAvatarFromFileToStorage(storage, authUser.uid, file);
        await updateAvatarUrl(avatarUrl);
        sendEvent('update_profile', { field: 'avatar' });
      } catch (err) {
        console.error('Failed to upload avatar', err);

        if (err instanceof AvatarPreparationError && err.code !== 'PROCESSING_FAILED') {
          sendEvent('update_profile_error', { field: 'avatar', reason: err.code });
        } else {
          captureClientException(err);
        }

        let description = '時間をおいて再度お試しください。';
        if (err instanceof AvatarPreparationError) {
          if (err.code === 'UNSUPPORTED_FILE_TYPE') {
            description = '対応していない画像形式です。JPEG / PNG / WebP の画像を選択してください。';
          } else if (err.code === 'FILE_TOO_LARGE_AFTER_COMPRESSION') {
            description = '画像の最適化後も 1MiB を超えています。別の画像を選択してください。';
          } else if (err.code === 'INVALID_IMAGE') {
            description = '画像の読み込みに失敗しました。別の画像をお試しください。';
          }
        }

        toast({
          title: 'アバターのアップロードに失敗しました',
          description,
          variant: 'destructive',
        });
      } finally {
        setUploading(false);
      }
    },
    [authUser?.uid, sendEvent, storage, updateAvatarUrl, toast],
  );

  const dropHandler = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (file === undefined) return;
      await uploadAvatar(file);
    },
    [uploadAvatar],
  );

  const { containerProps, inputProps } = useDropzone(dropHandler);

  const handleSave = async () => {
    if (!authUser || !me) return;

    setSaving(true);
    try {
      await updateName(displayName);
      sendEvent('update_profile', { field: 'name' });
      toast({
        title: '保存しました',
        description: '表示名が更新されました',
      });
    } catch (err) {
      console.error('Failed to save profile', err);
      captureClientException(err);
      toast({
        title: 'エラーが発生しました',
        description: '表示名の更新に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContainerSection label="アカウント情報" className="space-y-6">
      <div className="grid grid-cols-[auto_1fr]">
        <div className="flex items-center justify-center px-12">
          <input id="avatar-upload" type="file" accept="image/*" className="hidden" {...inputProps} />
          <div className="size-32 rounded-full relative" {...containerProps}>
            <UserAvatar avatarUrl={me?.avatarUrl} loading={meLoading} size={128} />
            {uploading ? (
              <div className="absolute inset-0 rounded-full bg-black/50 grid place-content-center text-white">
                <IconLoader2 className="size-6 animate-spin" />
              </div>
            ) : (
              <label
                htmlFor="avatar-upload"
                className="absolute text-xs text-center inset-0 rounded-full bg-black/50 grid place-content-center text-white opacity-0 transition-opacity hover:opacity-100"
                aria-label="クリックしてアイコンをアップロード"
              >
                <IconPhotoUp className="size-6" />
              </label>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">表示名</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="表示名を入力"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input id="email" value={authUser?.email ?? ''} readOnly />
              <div className="text-xs text-slate-500">メールアドレスは変更できません</div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={me === null || saving || displayName === me?.name}>
              {saving ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" />
                  <span>保存中</span>
                </>
              ) : (
                <>保存する</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </ContainerSection>
  );
};
