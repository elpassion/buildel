import { z } from 'zod';

export const blockIOSchema = z.object({
  name: z.string(),
  type: z.string(),
});
export type IBlockIO = z.infer<typeof blockIOSchema>;

export const blockTypeSchema = z.object({
  type: z.string(),
  schema: z.string(),
  inputs: blockIOSchema.array(),
  outputs: blockIOSchema.array(),
});
export type TBlockType = z.infer<typeof blockTypeSchema>;
