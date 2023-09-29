import z from "zod";
import { UpdateBlockConfig } from "../contracts";

export const schema = z.object({
  pipeline: z.object({
    name: z.string().min(2),
    config: z.object({
      version: z.string(),
      blocks: z.union([
        z.string().transform((value) => JSON.parse(value)),
        z.array(UpdateBlockConfig),
      ]),
    }),
  }),
});
