const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const API_URL = process.env.API_URL;
const PAGE_URL = process.env.PAGE_URL;

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  trailingSlash: true,
  env: {
    OPENAI_API_KEY,
    API_URL,
    PAGE_URL,
  },
};

export default config;
