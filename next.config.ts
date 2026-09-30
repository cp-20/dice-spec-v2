import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: { globalNotFound: true },
  redirects: async () => [
    // 空のワイルドカードが転送先に残らないよう、トップは個別に指定する。
    { source: '/en', destination: '/', permanent: true },
    { source: '/en/:path*', destination: '/:path*', permanent: true },
  ],
  pageExtensions: ['md', 'mdx', 'ts', 'tsx'],
  htmlLimitedBots: /Google-Site-Verification/,
};

export default nextConfig;
