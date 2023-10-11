/** @type {import('next').NextConfig} */

const v1AppUrl = 'https://v1.dicespec.vercel.app';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    typedRoutes: true,
  },
  redirects: async () => [
    {
      source: '/en/:path*',
      destination: `${v1AppUrl}/en/:path*`,
      basePath: false,
      permanent: true,
    },
    {
      source: '/analyze-logs/og',
      destination: `/analyze-logs`,
      permanent: true,
    },
  ],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: { overrides: { removeViewBox: false } },
                },
              ],
            },
          },
        },
      ],
    });
    return config;
  },
  images: {
    disableStaticImages: true,
  },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
