import z from "zod";

export const schema = z.object({
  email: z.string().email(),
  password: z.string().min(2),
  remember: z.string().optional(),
});
