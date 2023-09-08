import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export type ISignIn = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().nonempty().min(6),
});
export type ISignUp = z.infer<typeof signUpSchema>;

export const userSchema = z.object({
  id: z.string(),
});

export type TUser = z.infer<typeof userSchema>;
