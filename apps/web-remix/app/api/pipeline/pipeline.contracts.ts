import { z } from "zod";
import {
  BlockConfig,
  ConfigConnection,
  ExtendedBlockConfig,
  UpdateBlockConfig,
} from "~/api/blockType/blockType.contracts";
import { PaginationMeta } from "~/components/pagination/pagination.types";
import { zfd } from "zod-form-data";

export const InterfaceConfigForm = z.object({
  inputs: z
    .union([
      z.string().transform((value) => JSON.parse(value) as string[]),
      z.array(z.string()),
    ])
    .default([]),
  outputs: z
    .union([
      z.string().transform((value) => JSON.parse(value) as string[]),
      z.array(z.string()),
    ])
    .default([]),
  public: z
    .union([z.boolean(), z.string().transform((v) => v === "on")])
    .optional()
    .default(false),
});

export const InterfaceConfig = z.object({
  webchat: InterfaceConfigForm.optional().default({
    inputs: [] as string[],
    outputs: [] as string[],
    public: false,
  }),
  form: InterfaceConfigForm.optional().default({
    inputs: [] as string[],
    outputs: [] as string[],
    public: false,
  }),
});

export const Pipeline = z.object({
  id: z.number(),
  name: z.string(),
  organization_id: z.number(),
  runs_count: z.number(),
  budget_limit: z.union([zfd.numeric(), z.null()]),
  logs_enabled: z.boolean(),
  interface_config: z
    .union([InterfaceConfig, z.null()])
    .transform((c) =>
      c
        ? c
        : {
            webchat: {
              inputs: [],
              outputs: [],
              public: false,
            },
            form: {
              inputs: [],
              outputs: [],
              public: false,
            },
          },
    )
    .default({}),
  config: z.object({
    version: z.string(),
    blocks: z.array(BlockConfig),
    connections: z.array(ConfigConnection).default([]),
  }),
});

export const PipelinePublic = z.object({
  id: z.number(),
  name: z.string(),
  interface_config: z
    .union([InterfaceConfig, z.null()])
    .transform((c) =>
      c
        ? c
        : {
            webchat: {
              inputs: [],
              outputs: [],
              public: false,
            },
            form: {
              inputs: [],
              outputs: [],
              public: false,
            },
          },
    )
    .default({
      webchat: {
        inputs: [],
        outputs: [],
        public: false,
      },
      form: {
        inputs: [],
        outputs: [],
        public: false,
      },
    }),
});

export const ExtendedPipeline = z.object({
  id: z.number(),
  name: z.string(),
  organization_id: z.number(),
  runs_count: z.number(),
  interface_config: z.union([InterfaceConfig, z.null()]),
  config: z.object({
    version: z.string(),
    blocks: z.array(ExtendedBlockConfig),
    connections: z.array(ConfigConnection).default([]),
  }),
});

export const Alias = z.object({
  id: z.union([z.string().min(1), z.number()]),
  name: z.string().min(2),
  config: z.object({
    version: z.string(),
    blocks: z.array(BlockConfig),
    connections: z.array(ConfigConnection).default([]),
  }),
  interface_config: z.union([InterfaceConfig, z.null()]),
});

export const AliasResponse = z
  .object({
    data: Alias,
  })
  .transform((response) => {
    return response.data;
  });

export type IAliasResponse = z.TypeOf<typeof AliasResponse>;

export const AliasesResponse = z
  .object({ data: z.array(Alias) })
  .transform((response) => response.data);

export type IAliasesResponse = z.TypeOf<typeof AliasesResponse>;

export const PipelineCost = z.object({
  amount: z.string(),
  created_at: z.string(),
  description: z.string(),
  input_tokens: z.number(),
  output_tokens: z.number(),
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
    connections: z.array(ConfigConnection).default([]),
  }),
});

export const PipelineDetails = z.object({
  total_cost: z.union([
    z.number(),
    z.string().transform((value) => Number(value)),
  ]),
});

export type IPipelineDetails = z.TypeOf<typeof PipelineDetails>;

export const PipelineDetailsResponse = z
  .object({
    data: PipelineDetails,
  })
  .transform((response) => {
    return response.data;
  });

export type IPipelineDetailsResponse = z.TypeOf<typeof PipelineDetailsResponse>;

export const PipelineRuns = z.array(PipelineRun);

export const PipelinePublicResponse = z
  .object({
    data: PipelinePublic,
  })
  .transform((response) => {
    return response.data;
  });

export const PipelineResponse = z
  .object({
    data: Pipeline,
  })
  .transform((response) => {
    return response.data;
  });

export const PipelinesResponse = z.object({ data: z.array(Pipeline) });

export type IPipelinesResponse = z.TypeOf<typeof PipelinesResponse>;

export type IPipelineResponse = z.TypeOf<typeof PipelineResponse>;

export type IPipelinePublicResponse = z.TypeOf<typeof PipelinePublicResponse>;

export const PipelineRunsResponse = z.object({
  data: PipelineRuns,
  meta: PaginationMeta,
});

export const PipelineRunResponse = z
  .object({ data: PipelineRun })
  .transform((response) => {
    return response.data;
  });

export const CreateAliasSchema = z.object({
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

export const UpdateAliasSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1).optional(),
  interface_config: z
    .string()
    .transform((value) => JSON.parse(value))
    .optional(),
  config: z
    .string()
    .transform((value) => JSON.parse(value))
    .optional(),
});

export const UpdatePipelineSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  budget_limit: z.union([zfd.numeric(), z.null()]),
  logs_enabled: z.boolean(),
  interface_config: z.union([InterfaceConfig, z.null()]),
  config: z.object({
    version: z.string(),
    blocks: z.array(UpdateBlockConfig),
    connections: z.array(ConfigConnection).default([]),
  }),
});

export const CreatePipelineSchema = z.object({
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

export const PipelineRunLog = z.object({
  id: z.number(),
  message: z.string(),
  context: z.string(),
  message_types: z.array(z.string()),
  raw_logs: z.array(z.number()),
  block_name: z.string(),
  created_at: z.string(),
});

export const PipelineRunLogsResponse = z.object({
  data: z.array(PipelineRunLog),
  meta: z.object({
    after: z.string().nullish(),
    totalItems: z.number().nullish(),
  }),
});

export type IPipelineRunLogsResponse = z.TypeOf<typeof PipelineRunLogsResponse>;
export type IPipelineRunLog = z.TypeOf<typeof PipelineRunLog>;
