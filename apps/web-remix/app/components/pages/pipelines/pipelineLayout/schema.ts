import { z } from "zod";
import {
  ConfigConnection,
  InterfaceConfig,
  UpdateBlockConfig,
} from "../contracts";

export const updateSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  interface_config: z.union([InterfaceConfig, z.null()]),
  config: z.object({
    version: z.string(),
    blocks: z.array(UpdateBlockConfig),
    connections: z.array(ConfigConnection).default([]),
  }),
});

export const createAliasSchema = z.object({
  name: z.string().min(1),
  interface_config: z.union([
    z.string().transform((value) => JSON.parse(value)),
    InterfaceConfig,
    z.null(),
  ]),
  config: z.object({
    version: z.string(),
    blocks: z.union([
      z.string().transform((value) => JSON.parse(value)),
      z.array(UpdateBlockConfig),
    ]),
    connections: z.union([
      z.string().transform((value) => JSON.parse(value)),
      z.array(ConfigConnection).default([]),
    ]),
  }),
});
