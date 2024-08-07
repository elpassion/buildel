import z from 'zod';

export const schema = z.object({
  user: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
  redirectTo: z.string().optional(),
});
