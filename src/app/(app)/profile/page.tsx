import { IconUser } from '@tabler/icons-react';
import type { NextPage } from 'next';

import { PageTitle } from '@/app/(app)/_components/PageTitle';
import { type MetadataGenerator, metadataHelper, viewportGenerator } from '@/shared/lib/metadataGenerator';

import { ProfileContent } from './_components/ProfileContent';

export const generateMetadata: MetadataGenerator = async () => {
  return metadataHelper({
    title: 'アカウント情報',
    description: 'ユーザープロフィールページ',
    path: '/profile',
    noIndex: true,
    noFollow: true,
  });
};

export const viewport = viewportGenerator();

const ProfilePage: NextPage = async () => {
  return (
    <div className="space-y-6">
      <div>
        <PageTitle icon={IconUser}>アカウント情報</PageTitle>
      </div>
      <ProfileContent />
    </div>
  );
};

export default ProfilePage;
