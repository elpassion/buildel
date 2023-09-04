import { z } from 'zod';

export const appConfigSchema = z.object({
  version: z.string(),
  blocks: z.any(),
});
export type TAppConfig = z.infer<typeof appConfigSchema>;

export const appSchema = z.object({
  id: z.string(),
  name: z.number(),
  config: appConfigSchema,
});
export type TPipeline = z.infer<typeof appSchema>;

export const createAppSchema = z.object({
  pipeline: z.object({
    organization_id: z.number(),
    name: z.string({
      invalid_type_error: 'Name must be a string',
    }),
    config: z.object({
      version: z.string(),
      blocks: z.object({}).array(),
    }),
  }),
});
export type TCreatePipeline = z.infer<typeof createAppSchema>;
