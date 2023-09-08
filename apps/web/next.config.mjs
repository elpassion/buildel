import { ENV } from './src/env.mjs';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    serverActions: true,
  },
  env: {
    ...ENV,
  },
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: `${ENV.API_URL}/:path*`,
    },
    {
      source: '/socket/:path*',
      destination: `${ENV.API_URL}/socket/:path*`,
    }
  ],
};

export default config;
