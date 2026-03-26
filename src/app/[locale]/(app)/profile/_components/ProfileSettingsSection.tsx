'use client';

import { IconLoader2, IconPhotoUp } from '@tabler/icons-react';
import { t } from 'i18next';
import { useCallback, useEffect, useState } from 'react';
import { ContainerSection } from '@/app/[locale]/(app)/_components/ContainerSection';
import { useDropzone } from '@/app/[locale]/(app)/analyze-logs/_components/hooks/useDropzone';
import { MyAvatar } from '@/shared/components/elements/UserAvatar';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/components/ui/use-toast';
import { useMeStore } from '@/shared/lib/firebase/stores/userStore';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';
import { storagePaths, useStorage } from '@/shared/lib/firebase/useStorage';

export const ProfileSettingsSection = () => {
  const { authUser } = useFirebaseAuth();
  const { me, updateName, updateAvatarUrl } = useMeStore();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { uploadBuffer } = useStorage();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setDisplayName(me?.name ?? '');
  }, [me?.name]);

  const dropHandler = useCallback(
    (file: File) => {
      if (authUser?.uid === undefined) return;
      const reader = new FileReader();
      reader.addEventListener('load', async (e) => {
        if (e.target?.result) {
          const buffer = e.target.result;
          if (!(buffer instanceof ArrayBuffer)) return;
          setUploading(true);
          try {
            const url = await uploadBuffer(storagePaths.getAvatarPath(authUser?.uid), buffer);
            await updateAvatarUrl(url);
          } catch (err) {
            console.error('Failed to upload avatar', err);
            toast({
              title: t('profile:toast.avatar-upload-error-title'),
              description: t('profile:toast.avatar-upload-error-description'),
              variant: 'destructive',
            });
          } finally {
            setUploading(false);
          }
        }
      });
      reader.readAsArrayBuffer(file);
    },
    [updateAvatarUrl, uploadBuffer, authUser?.uid],
  );

  const { containerProps, inputProps } = useDropzone(dropHandler);

  const handleSave = async () => {
    if (!authUser || !me) return;

    setSaving(true);
    try {
      await updateName(displayName);
      toast({
        title: t('profile:toast.save-success-title'),
        description: t('profile:toast.save-success-description'),
      });
    } catch (err) {
      console.error('Failed to save profile', err);
      toast({
        title: t('profile:toast.save-error-title'),
        description: t('profile:toast.save-error-description'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContainerSection label={t('profile:title')} className="space-y-6">
      <div className="grid grid-cols-[auto_1fr]">
        <div className="flex items-center justify-center px-12">
          <input id="avatar-upload" type="file" accept="image/*" className="hidden" {...inputProps} />
          <div className="size-32 rounded-full relative" {...containerProps}>
            <MyAvatar size={128} />
            {uploading ? (
              <div className="absolute inset-0 rounded-full bg-black/50 grid place-content-center text-white">
                <IconLoader2 className="size-6 animate-spin" />
              </div>
            ) : (
              <label
                htmlFor="avatar-upload"
                className="absolute text-xs text-center inset-0 rounded-full bg-black/50 grid place-content-center text-white opacity-0 transition-opacity hover:opacity-100"
                aria-label={t('profile:avatar.aria-label')}
              >
                <IconPhotoUp className="size-6" />
              </label>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">{t('profile:display-name.label')}</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t('profile:display-name.placeholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('profile:email.label')}</Label>
              <Input id="email" value={authUser?.email ?? ''} readOnly />
              <div className="text-xs text-slate-500">{t('profile:email.hint')}</div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={me === null || saving || displayName === me?.name}>
              {saving ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" />
                  <span>{t('profile:button.saving')}</span>
                </>
              ) : (
                <>{t('profile:button.save')}</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </ContainerSection>
  );
};
