'use client';

import { ContainerSection } from '@/app/(app)/_components/ContainerSection';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';

import { PlanManagementSection } from './PlanManagementSection';
import { PricingCards } from './PricingCards';
import { ProfileSettingsSection } from './ProfileSettingsSection';
import { useCheckoutCompletion } from './useCheckoutCompletion';

export const ProfileContent = () => {
  const { authUser, loading } = useFirebaseAuth();
  useCheckoutCompletion();

  // 認証状態が確定するまでは、ログイン済みのユーザーにログイン案内を見せない。
  if (loading) {
    return (
      <ContainerSection>
        <Skeleton className="h-40 w-full" />
      </ContainerSection>
    );
  }

  if (!authUser) {
    return (
      <ContainerSection>
        {/* 有料機能の案内から来た未ログインのユーザーにも、プランの内容とログイン導線を同時に示す */}
        <div className="flex flex-col items-center py-8 gap-8">
          <div className="text-center text-slate-600">ログインするとプロフィールの確認やPROプランの登録ができます</div>
          <PricingCards />
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
