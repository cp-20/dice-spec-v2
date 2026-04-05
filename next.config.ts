import withBundleAnalyzerFn from '@next/bundle-analyzer';
import withMDXFn from '@next/mdx';
import { withSentryConfig } from '@sentry/nextjs';
import withPWAFn from 'next-pwa';

import { buildEnv } from './src/shared/lib/env';

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    loader: 'custom',
    loaderFile: './src/image-loader.ts',
  },
  redirects: async () => [
    {
      source: '/:path((?!_next/|assets).*)',
      destination: 'https://dicespec.app/:path',
      permanent: true,
      has: [{ type: 'host', value: 'dicespec.vercel.app' }],
      missing: [{ type: 'query', key: 'keep-old', value: 'true' }],
      statusCode: 301,
    },
  ],
  rewrites: async () => [
    {
      source: '/',
      destination: '/ja/',
    },
    {
      source: '/terms',
      destination: '/ja/terms',
    },
    {
      source: '/privacy-policy',
      destination: '/ja/privacy-policy',
    },
    {
      source: '/specified-commercial-transactions',
      destination: '/ja/specified-commercial-transactions',
    },
    {
      source: '/expect',
      destination: '/ja/expect',
    },
    {
      source: '/dice',
      destination: '/ja/dice',
    },
    {
      source: '/analyze-logs',
      destination: '/ja/analyze-logs',
    },
    {
      source: '/analyze-logs/list',
      destination: '/ja/analyze-logs/list',
    },
    {
      source: '/analyze-logs/:id',
      destination: '/ja/analyze-logs/:id',
    },
    {
      source: '/ccfolia',
      destination: '/ja/ccfolia',
    },
    {
      source: '/profile',
      destination: '/ja/profile',
    },
    {
      source: '/blogs',
      destination: '/ja/blogs',
    },
    {
      source: '/blogs/:category',
      destination: '/ja/blogs/:category',
    },
    {
      source: '/blogs/:category/:slug',
      destination: '/ja/blogs/:category/:slug',
    },
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

const withBundleAnalyzer = withBundleAnalyzerFn({
  enabled: buildEnv.analyzeEnabled,
});

const withPWA = withPWAFn({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: buildEnv.nodeEnv === 'development',
});

const withMDX = withMDXFn({});

const sentryConfig = {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'cp20',
  project: 'javascript-nextjs',
  authToken: buildEnv.sentryAuthToken,

  sourcemaps: {
    disable: true, // Source maps are enabled by default
    assets: ['**/*.js', '**/*.js.map'], // Specify which files to upload
    ignore: ['**/node_modules/**'], // Files to exclude
    deleteSourcemapsAfterUpload: true, // Security: delete after upload
  },

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
  disableLogger: true,
};

// @ts-expect-error
let config = withMDX(withBundleAnalyzer(withPWA(nextConfig)));

if (buildEnv.sentryAuthToken) {
  config = withSentryConfig(config, sentryConfig);
}

export default config;

import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

initOpenNextCloudflareForDev();
