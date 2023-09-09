import z from "zod";

export const schema = z.object({
  organization: z.object({
    name: z.string().min(2),
  }),
});
