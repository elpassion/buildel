import { z } from "zod";

export const IOType = z.object({
  name: z.string(),
  type: z.enum(["audio", "text", "file", "worker", "controller"]),
  public: z.boolean(),
});

export const BlockType = z.object({
  type: z.string(),
  description: z.string(),
  groups: z.array(z.string()),
  inputs: z.array(IOType),
  outputs: z.array(IOType),
  ios: z.array(IOType),
  schema: z.record(z.string(), z.any()),
});

export const ConfigConnection = z.object({
  from: z.object({
    block_name: z.string(),
    output_name: z.string(),
  }),
  to: z.object({
    block_name: z.string(),
    input_name: z.string(),
  }),
  opts: z
    .object({
      reset: z.boolean().default(true),
    })
    .default({
      reset: true,
    }),
});

export const BlockConfig = z.object({
  name: z.string(),
  opts: z.record(z.string(), z.any()),
  inputs: z.array(z.string()).default([]),
  connections: z.array(ConfigConnection).default([]),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  type: z.string(),
});

export const ExtendedBlockConfig = BlockConfig.extend({
  block_type: BlockType.optional(),
});

export const UpdateBlockConfig = z.object({
  name: z.string(),
  opts: z.record(z.string(), z.any()),
  inputs: z.array(z.string()),
  connections: z.array(
    z.object({
      from: z.object({
        block_name: z.string(),
        output_name: z.string(),
      }),
      to: z.object({
        block_name: z.string(),
        input_name: z.string(),
      }),
      opts: z
        .object({
          reset: z.boolean().optional().default(true),
        })
        .default({
          reset: true,
        }),
    })
  ),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  type: z.string(),
  block_type: BlockType.optional(),
});

export const BlockTypes = z.array(BlockType);

export const BlockTypesResponse = z.object({
  data: BlockTypes,
});
