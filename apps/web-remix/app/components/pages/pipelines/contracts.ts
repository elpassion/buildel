import { number, z } from "zod";
import { KnowledgeBaseFile } from "~/components/pages/knowledgeBase/contracts";

export const IOType = z.object({
  name: z.string(),
  type: z.enum(["audio", "text", "file"]),
  public: z.boolean(),
});

export const BlockType = z.object({
  type: z.string(),
  groups: z.array(z.string()),
  inputs: z.array(IOType),
  outputs: z.array(IOType),
  schema: z.record(z.string(), z.any()),
});

export const BlockConfig = z.object({
  name: z.string(),
  opts: z.record(z.string(), z.any()),
  inputs: z.array(z.string()),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  type: z.string(),
  block_type: BlockType,
});

export const UpdateBlockConfig = z.object({
  name: z.string(),
  opts: z.record(z.string(), z.any()),
  inputs: z.array(z.string()),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  type: z.string(),
  block_type: BlockType.optional(),
});

export const Pipeline = z.object({
  id: z.number(),
  name: z.string(),
  organization_id: z.number(),
  runs_count: z.number(),
  config: z.object({
    version: z.string(),
    blocks: z.array(BlockConfig),
  }),
});

export const PipelineRun = z.object({
  created_at: z.string(),
  id: z.number(),
  name: z.string(),
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

export const PipelineRunsResponse = z
  .object({ data: PipelineRuns })
  .transform((response) => {
    return response.data;
  });

export const PipelinesResponse = z.object({ data: z.array(Pipeline) });

export const BlockTypes = z.array(BlockType);

export const BlockTypesResponse = z.object({
  data: BlockTypes,
});
