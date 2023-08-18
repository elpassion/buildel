import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { ENV } from '~/env.mjs';

export function usePipelines() {
  return useQuery(['pipelines'], async () => {
    const response = await fetch(`${ENV.API_URL}/pipelines`);
    const json = response.json();
    return PipelinesResponse.parse(json);
  });
}

export function usePipeline(pipelineId: string) {
  return useQuery(['pipelines', pipelineId], async () => {
    const response = await fetch(`${ENV.API_URL}/pipelines/${pipelineId}`);
    const json = await response.json();
    return PipelineResponse.parse(json);
  });
}

export function useBlockTypes() {
  return useQuery(['blockTypes'], async () => {
    const response = await fetch(`${ENV.API_URL}/block_types`);
    const json = await response.json();
    return BlockTypesResponse.parse(json);
  });
}

export const Pipeline = z.object({
  id: z.number(),
  name: z.string(),
  config: z.object({
    version: z.string(),
    blocks: z.array(
      z.object({
        name: z.string(),
        forward_outputs: z.array(z.string()),
        opts: z.object({}),
        type: z.string(),
      }),
    ),
  }),
});

export const PipelineResponse = z.object({
  data: Pipeline,
});

export const PipelinesResponse = z.object({ data: z.array(Pipeline) });

export const IOType = z.object({
  name: z.string(),
  type: z.enum(['audio', 'text']),
});

export const BlockType = z.object({
  type: z.string(),
  inputs: z.array(IOType),
  outputs: z.array(IOType),
  schema: z.string(),
});

const BlockTypes = z.array(BlockType);

const BlockTypesResponse = z.object({
  data: BlockTypes,
});

const Block = z.object({
  name: z.string(),
  forward_outputs: z.array(z.string()),
  opts: z.object({}),
  config: BlockType,
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
