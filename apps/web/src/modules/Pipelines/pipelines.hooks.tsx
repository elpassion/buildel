import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { ENV } from '~/env.mjs';

export function usePipelines() {
  return useQuery(['pipelines'], async () => {
    const response = await fetch(`${ENV.API_URL}/pipelines`);
    const json = response.json();
    return PipelinesResponse.parse(json).data;
  });
}

export function usePipeline(pipelineId: string) {
  return useQuery(
    ['pipelines', pipelineId],
    async () => {
      const response = await fetch(`${ENV.API_URL}/pipelines/${pipelineId}`);
      const json = await response.json();
      return PipelineResponse.parse(json).data;
    },
    {
      initialData: {
        id: parseInt(pipelineId),
        name: '',
        config: {
          version: '0',
          blocks: [],
        },
      },
    },
  );
}

export function useUpdatePipeline(
  pipelineId: string,
  {
    onSuccess,
  }: {
    onSuccess?: (response: z.TypeOf<typeof PipelineResponse>['data']) => void;
  } = {},
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pipeline: Omit<z.TypeOf<typeof Pipeline>, 'id'>) => {
      const response = await fetch(`${ENV.API_URL}/pipelines/${pipelineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pipeline }),
      });
      const json = await response.json();
      const pipelineResponse = PipelineResponse.parse(json).data;
      queryClient.setQueryData(['pipelines', pipelineId], pipelineResponse);
      onSuccess?.(pipelineResponse);
    },
  });
}

export function useBlockTypes() {
  return useQuery(['blockTypes'], async () => {
    const response = await fetch(`${ENV.API_URL}/block_types`);
    const json = await response.json();
    return BlockTypesResponse.parse(json).data;
  });
}

export const BlockConfig = z.object({
  name: z.string(),
  forward_outputs: z.array(z.string()),
  opts: z.object({}),
  type: z.string(),
});

export const Pipeline = z.object({
  id: z.number(),
  name: z.string(),
  config: z.object({
    version: z.string(),
    blocks: z.array(BlockConfig),
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
