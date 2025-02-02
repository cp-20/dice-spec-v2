export const i18nConfig = {
  locales: ['en', 'ja'],
  defaultLocale: 'ja',
} as const;

export type Locale = (typeof i18nConfig)['locales'][number];
