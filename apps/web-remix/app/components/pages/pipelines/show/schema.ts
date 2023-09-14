import { z } from "zod";
import { UpdateBlockConfig } from "../contracts";
import { zfd } from "zod-form-data";

export const updateSchema = z.object({
  id: z.number(),
  name: z.string(),
  config: z.object({
    version: z.string(),
    blocks: z.array(UpdateBlockConfig),
  }),
});

export const uploadSchema = z.object({
  collection_name: z.string(),
  file: z.any(),
});
