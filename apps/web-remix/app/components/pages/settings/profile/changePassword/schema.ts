import z from 'zod';

export const changePasswordSchema = z.object({
  current_password: z.string().min(2),
  password: z.string().min(2),
  password_confirmation: z.string().min(2),
});
