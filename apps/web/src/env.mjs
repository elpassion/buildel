import z from 'zod';

const envSchema = z.object({
  WEBSOCKET_URL: z.string().url(),
});

const envs = {
  WEBSOCKET_URL: process.env.WEBSOCKET_URL,
};

export const ENV = envSchema.parse(envs);
