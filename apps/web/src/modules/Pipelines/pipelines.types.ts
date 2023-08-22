import { z } from 'zod';

export const IOType = z.object({
  name: z.string(),
  type: z.enum(['audio', 'text']),
  public: z.boolean(),
});

export type IIO = z.TypeOf<typeof IOType>;

export type BlocksIO = {
  inputs: IIO[];
  outputs: IIO[];
};
export const BlockType = z.object({
  type: z.string(),
  inputs: z.array(IOType),
  outputs: z.array(IOType),
  schema: z.string(),
});

export const BlockConfig = z.object({
  name: z.string(),
  opts: z.record(z.string(), z.any()),
  type: z.string(),
  block_type: BlockType,
});

export type IBlockConfig = z.TypeOf<typeof BlockConfig>;
export const Pipeline = z.object({
  id: z.number(),
  name: z.string(),
  config: z.object({
    version: z.string(),
    blocks: z.array(BlockConfig),
  }),
});

export type IPipeline = z.infer<typeof Pipeline>;

export const PipelineResponse = z
  .object({
    data: Pipeline,
  })
  .transform((response) => {
    return response.data;
  });

export const PipelinesResponse = z.object({ data: z.array(Pipeline) });

export const BlockTypes = z.array(BlockType);

export type IBlockTypes = z.TypeOf<typeof BlockTypes>;

export type IBlockTypesObj = Record<string, z.TypeOf<typeof BlockType>>;
export const BlockTypesResponse = z.object({
  data: BlockTypes,
});

export type JSONSchemaField =
  | {
      type: 'object';
      properties: { [key: string]: JSONSchemaField };
      required?: string[];
    }
  | {
      type: 'string';
      title: string;
      description: string;
      minLength?: number;
    }
  | {
      type: 'string';
      title: string;
      description: string;
      minLength?: number;
      enum: string[];
      enumPresentAs: 'checkbox' | 'radio';
    }
  | {
      type: 'number';
      title: string;
      description: string;
      minimum?: number;
      maximum?: number;
    }
  | {
      type: 'array';
      title: string;
      description: string;
      items: JSONSchemaField;
    };
