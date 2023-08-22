import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Channel, Socket } from 'phoenix';
import { z } from 'zod';
import { ENV } from '~/env.mjs';
import { assert } from '~/utils/assert';

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
      return PipelineResponse.parse(json);
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
    onSuccess?: (response: z.TypeOf<typeof PipelineResponse>) => void;
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
      const pipelineResponse = PipelineResponse.parse(json);
      queryClient.setQueryData(['pipelines', pipelineId], pipelineResponse);
      onSuccess?.(pipelineResponse);
    },
  });
}

export function useBlockTypes() {
  return useQuery(
    ['blockTypes'],
    async () => {
      const response = await fetch(`${ENV.API_URL}/block_types`);
      const json = await response.json();
      return BlockTypesResponse.parse(json).data.reduce((acc, blockType) => {
        acc[blockType.type] = blockType;
        return acc;
      }, {} as Record<string, z.TypeOf<typeof BlockType>>);
    },
    {
      initialData: {},
    },
  );
}

export function usePipelineRun(
  pipelineId: string,
  onOutput: (
    blockId: string,
    outputName: string,
    payload: unknown,
  ) => void = () => {},
) {
  const { data: pipeline } = usePipeline(pipelineId);
  const { config } = pipeline;
  const io = getBlocksIO(config.blocks);

  const socket = useRef<Socket>();
  const channel = useRef<Channel>();
  socket.current = new Socket(`${ENV.WEBSOCKET_URL}`, {
    logger: (kind, msg, data) => {
      console.log(`${kind}: ${msg}`, data);
    },
  });

  const [status, setStatus] = useState<'idle' | 'starting' | 'running'>('idle');

  function startRun() {
    assert(socket.current);

    setStatus('starting');
    const newChannel = socket.current.channel(`pipelines:${pipelineId}`, {});
    newChannel.onMessage = (event: string, payload: any) => {
      if (event.startsWith('output:')) {
        const [_, blockId, outputName] = event.split(':');
        onOutput(blockId, outputName, payload);
      }
      return payload;
    };
    channel.current = newChannel;

    if (!socket.current.isConnected()) {
      socket.current.connect();
      socket.current.onOpen(() => {
        assert(socket.current);
        newChannel.join().receive('ok', (response) => {
          console.log('Joined successfully', response);
          setStatus('running');
        });
      });
      socket.current.onError(() => {
        setStatus('idle');
      });
    } else if (newChannel.state !== 'joined') {
      newChannel.join().receive('ok', (response) => {
        console.log('Joined successfully', response);
        setStatus('running');
      });
    }
  }

  function stopRun() {
    console.log('stop');
    assert(channel.current);
    channel.current.leave();
    setStatus('idle');
  }

  function push(topic: string, payload: any) {
    assert(channel.current);
    channel.current.push(`input:${topic}`, payload);
  }

  return {
    status,
    startRun,
    stopRun,
    push,
    io,
  };
}

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

export function getBlocksIO(blocks: z.TypeOf<typeof BlockConfig>[]): BlocksIO {
  return blocks.reduce(
    ({ inputs, outputs }, block) => {
      const publicInputs = block.block_type.inputs.filter(
        (input) => input.public,
      );
      const publicOutputs = block.block_type.outputs.filter(
        (output) => output.public,
      );

      return {
        inputs: [...inputs, ...nameIO(block.name, publicInputs)],
        outputs: [...outputs, ...nameIO(block.name, publicOutputs)],
      };
    },
    {
      inputs: [] as z.TypeOf<typeof IOType>[],
      outputs: [] as z.TypeOf<typeof IOType>[],
    },
  );
}

function nameIO(name: string, io: z.TypeOf<typeof IOType>[]) {
  return io.map((input) => ({
    ...input,
    name: `${name}:${input.name}`,
  }));
}

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

export const PipelineResponse = z
  .object({
    data: Pipeline,
  })
  .transform((response) => {
    return response.data;
  });

export const PipelinesResponse = z.object({ data: z.array(Pipeline) });

const BlockTypes = z.array(BlockType);

export type IBlockTypes = z.TypeOf<typeof BlockTypes>;

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
