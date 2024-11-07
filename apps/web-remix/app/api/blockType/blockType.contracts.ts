import { z } from 'zod';

export const IOType = z.object({
  name: z.string(),
  type: z.enum([
    'audio',
    'text',
    'file',
    'file_temporary',
    'worker',
    'controller',
    'image',
  ]),
  public: z.boolean(),
  visible: z.boolean(),
});

export const BlockType = z.object({
  type: z.string(),
  description: z.string(),
  groups: z.array(z.string()),
  inputs: z.array(IOType),
  outputs: z.array(IOType),
  ios: z.array(IOType),
  dynamic_ios: z.union([z.string(), z.null()]),
  schema: z.record(z.string(), z.any()),
});

export const ConfigConnection = z.object({
  from: z.object({
    block_name: z.string(),
    output_name: z.string(),
    type: z.string().optional(),
  }),
  to: z.object({
    block_name: z.string(),
    input_name: z.string(),
    type: z.string().optional(),
  }),
  opts: z
    .object({
      reset: z.boolean().default(true),
      optional: z.boolean().optional().default(false),
    })
    .default({
      reset: true,
      optional: false,
    }),
});

export const BlockMeasured = z.object({
  width: z.number().optional(),
  height: z.number().optional(),
});

export const BlockConfig = z.object({
  name: z.string(),
  opts: z.record(z.string(), z.any()),
  inputs: z.array(z.string()).default([]),
  connections: z.array(ConfigConnection).default([]),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  type: z.string(),
  measured: BlockMeasured.optional(),
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
          reset: z.boolean().default(true),
          optional: z.boolean().optional().default(false),
        })
        .default({
          reset: true,
          optional: false,
        }),
    }),
  ),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  measured: BlockMeasured.optional(),
  type: z.string(),
  block_type: BlockType.optional(),
});

export const BlockTypes = z.array(BlockType);

export const BlockTypesResponse = z.object({
  data: BlockTypes,
});

export type IBlockTypes = z.TypeOf<typeof BlockTypes>;

export type IBlockTypesResponse = z.TypeOf<typeof BlockTypesResponse>;

export const DynamicIOs = z.object({
  inputs: z.array(IOType),
  outputs: z.array(IOType),
  ios: z.array(IOType),
});

export const DynamicIOsResponse = z.object({
  data: DynamicIOs,
});

export type IDynamicIOsResponse = z.TypeOf<typeof DynamicIOsResponse>;
