import z from "zod";

export const schema = z.object({
  input: z.string().min(2),
  output: z.string().min(2),
  chat: z.string().min(2),
  public: z
    .union([
      z.boolean(),
      z.string().transform((v) => {
        return v === "on";
      }),
    ])
    .optional(),
});
