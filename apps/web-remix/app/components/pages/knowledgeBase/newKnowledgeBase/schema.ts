import z from "zod";

export const schema = z.object({
  collection_name: z.string().min(2),
});
