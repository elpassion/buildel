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
};

export default config;
