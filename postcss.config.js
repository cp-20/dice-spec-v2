import { env } from 'node:process';

export default {
  plugins: {
    '@tailwindcss/postcss': {},
    ...(env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
  },
};
