import withBundleAnalyzerFn from '@next/bundle-analyzer';
import withMDXFn from '@next/mdx';
import withPWAFn from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  rewrites: async () => [
    {
      source: '/analyze-logs/og',
      destination: '/ja/analyze-logs',
    },
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

export default withMDX(withBundleAnalyzer(withPWA(nextConfig)));
