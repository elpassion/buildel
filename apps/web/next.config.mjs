import { ENV } from './src/env.mjs';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  env: {
    ...ENV,
  },
};

export default config;
