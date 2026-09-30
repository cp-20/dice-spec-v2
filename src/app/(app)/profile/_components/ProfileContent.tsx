'use client';

import { ContainerSection } from '@/app/(app)/_components/ContainerSection';
import { GoogleSignInAgreement } from '@/shared/components/elements/GoogleSignInAgreement';
import { GoogleSignInButton } from '@/shared/components/elements/GoogleSignInButton';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';

import { PlanManagementSection } from './PlanManagementSection';
import { ProfileSettingsSection } from './ProfileSettingsSection';

export const ProfileContent = () => {
  const { authUser } = useFirebaseAuth();

  if (!authUser) {
    return (
      <ContainerSection>
        <div className="flex flex-col items-center py-8 gap-8">
          <div className="text-center text-slate-600">ログインしてプロフィールを表示してください</div>
          <div className="flex flex-col gap-2 items-center">
            <GoogleSignInButton size="md" />
            <GoogleSignInAgreement />
          </div>
        </div>
      </ContainerSection>
    );
  }

  return (
    <>
      <ProfileSettingsSection />
      <PlanManagementSection />
    </>
  );
};
