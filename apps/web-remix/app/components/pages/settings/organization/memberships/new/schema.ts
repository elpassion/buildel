import z from "zod";

export const schema = z.object({
  membership: z.object({
    user_email: z.string().email(),
  }),
});
