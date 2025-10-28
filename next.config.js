import withBundleAnalyzerFn from '@next/bundle-analyzer';
import withMDXFn from '@next/mdx';
import { withSentryConfig } from '@sentry/nextjs';
import withPWAFn from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  redirects: async () => [
    {
      source: '/:path*',
      destination: 'https://dicespec.app/:path*',
      permanent: true,
      has: [{ type: 'host', value: 'dicespec.vercel.app' }],
    },
  ],
  rewrites: async () => [
    {
      source: '/',
      destination: '/ja/',
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
      source: '/ccfolia',
      destination: '/ja/ccfolia',
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
  enabled: process.env.ANALYZE === 'true',
});

const withPWA = withPWAFn({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const withMDX = withMDXFn({});

const sentryConfig = {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'cp20',
  project: 'javascript-nextjs',
  authToken: process.env.SENTRY_AUTH_TOKEN,

  sourcemaps: {
    disable: false, // Source maps are enabled by default
    assets: ['**/*.js', '**/*.js.map'], // Specify which files to upload
    ignore: ['**/node_modules/**'], // Files to exclude
    deleteSourcemapsAfterUpload: true, // Security: delete after upload
  },

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

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

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
};

export default withSentryConfig(withMDX(withBundleAnalyzer(withPWA(nextConfig))), sentryConfig);
