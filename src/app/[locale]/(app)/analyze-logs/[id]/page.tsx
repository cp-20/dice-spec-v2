import type { FirebaseOptions } from 'firebase/app';
import { FirebaseError, getApp, getApps, initializeApp } from 'firebase/app';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { t } from 'i18next';
import { storagePaths } from '@/shared/lib/firebase/storage/paths';
import {
  localeHelper,
  type MetadataGenerator,
  metadataHelper,
  viewportGenerator,
} from '@/shared/lib/metadataGenerator';
import AnalyzeLogDetailPageClient from './_components/AnalyzeLogDetailPageClient';
import { wrapPage } from '@/shared/i18n/page-layout';

const firebaseConfig: FirebaseOptions = {
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

const getAnalysisOgpUrl = async (analysisId: string) => {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const storage = getStorage(app);
    const storageRef = ref(storage, storagePaths.getAnalysisOgImagePath(analysisId));

    return await getDownloadURL(storageRef);
  } catch (err) {
    if (err instanceof FirebaseError) {
      if (err.code === 'storage/object-not-found' || err.code === 'storage/unauthorized') {
        return undefined;
      }
    }
    console.error(err);
    return undefined;
  }
};

export const generateMetadata: MetadataGenerator = async (props) => {
  const params = await props.params;
  const analysisId = typeof params.id === 'string' ? params.id : '';

  const title = t('common:analyze-logs.title');
  const description = t('analyze-logs:usage1');
  const locale = await localeHelper(props);
  const ogp = analysisId ? await getAnalysisOgpUrl(analysisId) : undefined;

  return metadataHelper({
    title,
    description,
    path: `/analyze-logs/${analysisId}`,
    locale,
    ogp,
  });
};

export const viewport = viewportGenerator();

export default wrapPage(AnalyzeLogDetailPageClient);
