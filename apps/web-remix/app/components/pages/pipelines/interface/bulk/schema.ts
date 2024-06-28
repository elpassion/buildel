import z from "zod";

export const schema = z.object({
  inputs: z.string().min(2),
  outputs: z.string().min(2),
});
