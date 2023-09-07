import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string(),
  password: z.string(),
});
export type ISignIn = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  email: z.string(),
  password: z.string(),
});
export type ISignUp = z.infer<typeof signUpSchema>;
