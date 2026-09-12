import * as i18n from 'i18next';

import { i18nextInitOptions } from '@/locales/i18next';

// ページ単独の RSC リクエストでも、言語切り替え前に必ず初期化する。
i18n.init(i18nextInitOptions, (err) => {
  if (err) {
    console.error('i18next failed to initialize', err);
  }
});

export { i18n };
