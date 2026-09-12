import withMDXFn from '@next/mdx';
import { withSentryConfig } from '@sentry/nextjs/config';

import { buildEnv } from './src/shared/lib/env';

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: { globalNotFound: true },
  // CI の TypeScript 7 を唯一の型検査にして、next build で同じ検査を重複させない。
  typescript: { ignoreBuildErrors: true },
  images: {
    loader: 'custom',
    // Next.js が設定ファイル経由で読み込むため、静的解析では未使用に見える。
    loaderFile: './src/image-loader.ts',
  },
  redirects: async () => [
    // OpenNext では空のワイルドカードが転送先に残るため、トップは個別に指定する。
    { source: '/en', destination: '/', permanent: true },
    { source: '/en/:path*', destination: '/:path*', permanent: true },
  ],
  pageExtensions: ['md', 'mdx', 'ts', 'tsx'],
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  htmlLimitedBots: /Google-Site-Verification/,
};

const withMDX = withMDXFn({});

const sentryConfig = {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'cp20',
  project: 'javascript-nextjs',
  authToken: buildEnv.sentryAuthToken,

  // Only print logs for uploading source maps in CI
  silent: !buildEnv.ci,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
};

// @ts-expect-error
let config = withMDX(nextConfig);

config = withSentryConfig(config, sentryConfig);

export default config;

import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

initOpenNextCloudflareForDev();
