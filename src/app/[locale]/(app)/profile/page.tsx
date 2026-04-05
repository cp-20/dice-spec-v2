import { IconUser } from '@tabler/icons-react';
import { t } from 'i18next';
import type { NextPage } from 'next';

import { PageTitle } from '@/app/[locale]/(app)/_components/PageTitle';
import { wrapPage } from '@/shared/i18n/page-layout';
import {
  localeHelper,
  type MetadataGenerator,
  metadataHelper,
  viewportGenerator,
} from '@/shared/lib/metadataGenerator';

import { ProfileContent } from './_components/ProfileContent';

export const generateMetadata: MetadataGenerator = async (props) => {
  const locale = await localeHelper(props);
  return metadataHelper({
    title: t('profile:title'),
    description: t('profile:description'),
    path: '/profile',
    locale,
    noIndex: true,
    noFollow: true,
  });
};

export const viewport = viewportGenerator();

const ProfilePage: NextPage = async () => {
  return (
    <div className="space-y-6">
      <div>
        <PageTitle icon={IconUser}>{t('profile:title')}</PageTitle>
      </div>
      <ProfileContent />
    </div>
  );
};

export default wrapPage(ProfilePage);
