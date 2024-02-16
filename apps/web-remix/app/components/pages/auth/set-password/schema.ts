import z from "zod";

export const schema = z.object({
  token: z.string(),
  password: z.string().min(12),
  password_confirmation: z.string().min(12),
});
