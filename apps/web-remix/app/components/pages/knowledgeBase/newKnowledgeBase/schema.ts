import z from "zod";

export const schema = z.object({
  collection_name: z.string().min(2),
  embeddings: z.object({
    api_type: z.string().min(2),
    model: z.string().min(2),
    secret_name: z.string().min(2),
  }),
});
