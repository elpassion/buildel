import { z } from 'zod';

// app == pipeline

export const appConfigSchema = z.object({
  version: z.number(),
  blocks: z.any(),
});
export type TAppConfig = z.infer<typeof appConfigSchema>;

export const appSchema = z.object({
  id: z.string(),
  name: z.number(),
  config: appConfigSchema,
});
export type TApp = z.infer<typeof appSchema>;

export const createAppSchema = z.object({
  name: z.string({
    invalid_type_error: 'Name must be a string',
  }),
  version: z.number(),
  blocks: z.object({}).array(),
});
export type TCreateApp = z.infer<typeof createAppSchema>;
