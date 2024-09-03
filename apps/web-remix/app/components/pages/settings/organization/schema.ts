import z from 'zod';

export const schema = z.object({
  organization: z.object({
    name: z.string().min(1),
    el_id: z.union([z.string(), z.number()]).nullable().optional(),
  }),
});
