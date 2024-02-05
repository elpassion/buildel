import z from "zod";
import { ConfigConnection, UpdateBlockConfig } from "../contracts";

export const schema = z.object({
  pipeline: z.object({
    name: z.string().min(2),
    config: z.object({
      version: z.string(),
      connections: z.union([
        z.string().transform((value) => JSON.parse(value)),
        z.array(ConfigConnection).default([]),
      ]),
      blocks: z.union([
        z.string().transform((value) => JSON.parse(value)),
        z.array(UpdateBlockConfig),
      ]),
    }),
  }),
});
