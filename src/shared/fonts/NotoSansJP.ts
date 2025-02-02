import localFont from 'next/font/local';

export const fontNotoSansJP = localFont({
  src: [
    {
      path: '../../../public/fonts/noto-sans-jp-v53-japanese_latin-regular.woff2',
      style: 'normal',
      weight: '400',
    },
    {
      path: '../../../public/fonts/noto-sans-jp-v53-japanese_latin-500.woff2',
      style: 'normal',
      weight: '500',
    },
    {
      path: '../../../public/fonts/noto-sans-jp-v53-japanese_latin-600.woff2',
      style: 'normal',
      weight: '600',
    },
    {
      path: '../../../public/fonts/noto-sans-jp-v53-japanese_latin-700.woff2',
      style: 'normal',
      weight: '700',
    },
  ],
});
