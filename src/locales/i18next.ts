import type { InitOptions } from 'i18next';
import { en } from './en';
import { ja } from './ja';

export const i18nextInitOptions: InitOptions = {
  lng: 'ja',
  fallbackLng: 'ja',
  defaultNS: 'translation',
  resources: { en, ja },
};
