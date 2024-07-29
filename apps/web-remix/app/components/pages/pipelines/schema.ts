import { z } from 'zod';

export const updatePipelineNameSchema = z.object({
  name: z.string().min(2),
});
