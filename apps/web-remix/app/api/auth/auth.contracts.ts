import { z } from 'zod';

export const SignInSchema = z.object({
  user: z.object({
    email: z.string().email(),
    password: z.string().min(2),
  }),
  redirectTo: z.string().optional(),
});

export const SignUpInvitation = z.object({
  password: z.string().min(12),
  token: z.string(),
});

export type ISignInSchema = z.TypeOf<typeof SignInSchema>;

export const SignUpSchema = z.object({
  user: z.object({
    email: z.string().email(),
    password: z.string().min(2),
  }),
});

export type ISignUpSchema = z.TypeOf<typeof SignUpSchema>;

export const SignUpDisabledResponse = z
  .object({
    data: z.object({ registration_disabled: z.boolean() }),
  })
  .transform((res) => res.data);
