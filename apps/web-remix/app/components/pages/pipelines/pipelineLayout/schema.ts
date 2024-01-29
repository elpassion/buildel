import { z } from "zod";
import { InterfaceConfig, UpdateBlockConfig } from "../contracts";

export const updateSchema = z.object({
  id: z.number(),
  name: z.string(),
  interfaceConfig: InterfaceConfig.optional(),
  config: z.object({
    version: z.string(),
    blocks: z.array(UpdateBlockConfig),
  }),
});
