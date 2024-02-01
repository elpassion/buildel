import { z } from "zod";
import { InterfaceConfig, UpdateBlockConfig } from "../contracts";

export const updateSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  interface_config: z.union([InterfaceConfig, z.null()]),
  config: z.object({
    version: z.string(),
    blocks: z.array(UpdateBlockConfig),
  }),
});
