import z from 'zod';

const envSchema = z.object({
  WEBSOCKET_URL: z.string().url(),
  API_URL: z.string().url(),
  PAGE_URL:z.string().url()
});

const envs = {
  WEBSOCKET_URL: process.env.WEBSOCKET_URL,
  API_URL: process.env.API_URL,
  PAGE_URL: process.env.PAGE_URL
};

export const ENV = envSchema.parse(envs);
