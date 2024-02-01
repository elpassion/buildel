import z from "zod";

export const schema = z.object({
  input: z.string().min(2),
  output: z.string().min(2),
});
