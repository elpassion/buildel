import z from 'zod';

export const schema = z
  .object({
    password: z.string().min(12),
    confirmPassword: z.string().optional(),
    token: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
