import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string(),
  password: z.string(),
});
export type ISignIn = z.infer<typeof signInSchema>;
