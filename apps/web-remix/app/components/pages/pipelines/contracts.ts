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
  inputs: z.array(z.string()),
  connections: z.array(ConfigConnection).default([]),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  type: z.string(),
  block_type: BlockType,
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

export const InterfaceConfig = z.object({
  input: z.string().min(2),
  output: z.string().min(2),
});

export const Pipeline = z.object({
  id: z.number(),
  name: z.string(),
  organization_id: z.number(),
  runs_count: z.number(),
  interface_config: z.union([InterfaceConfig, z.null()]),
  config: z.object({
    version: z.string(),
    blocks: z.array(BlockConfig),
    connections: z.array(ConfigConnection).default([]),
  }),
});

export const PipelineCost = z.object({
  amount: z.string(),
  created_at: z.string(),
  description: z.string(),
  id: z.number(),
});

export const PipelineCosts = z.array(z.object({ data: PipelineCost }));

export const PipelineRun = z.object({
  created_at: z.string(),
  costs: z.array(z.object({ data: PipelineCost })),
  id: z.number(),
  status: z.string(),
  config: z.object({
    version: z.string(),
    blocks: z.array(BlockConfig),
  }),
});

export const PipelineRuns = z.array(PipelineRun);

export const PipelineResponse = z
  .object({
    data: Pipeline,
  })
  .transform((response) => {
    return response.data;
  });

export const PipelinesResponse = z.object({ data: z.array(Pipeline) });

export const PipelineRunsResponse = z
  .object({ data: PipelineRuns })
  .transform((response) => {
    return response.data;
  });
export const PipelineRunResponse = z
  .object({ data: PipelineRun })
  .transform((response) => {
    return response.data;
  });
export const BlockTypes = z.array(BlockType);

export const BlockTypesResponse = z.object({
  data: BlockTypes,
});
