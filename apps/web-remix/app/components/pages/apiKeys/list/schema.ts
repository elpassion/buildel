import z from "zod";

export const schema = z.object({
  id: z.number(),
  name: z.string().min(2),
  key: z.string().min(2),
});
