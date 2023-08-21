import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Channel, Socket } from 'phoenix';
import { useRef, useState } from 'react';
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

export function usePipelineRun(
  pipelineId: string,
  onOutput: (
    blockId: string,
    outputName: string,
    payload: unknown,
  ) => void = () => {},
) {
  const { data: pipeline } = usePipeline(pipelineId);
  const { data: blockTypes } = useBlockTypes();
  const { config } = pipeline;
  const io = getBlocksIO(config.blocks, blockTypes || []);

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

export type IO = z.TypeOf<typeof IOType>;

export type BlocksIO = {
  inputs: IO[];
  outputs: IO[];
};

export function getBlocksIO(
  blocks: z.TypeOf<typeof BlockConfig>[],
  blockTypes: z.TypeOf<typeof BlockType>[],
): BlocksIO {
  return blocks.reduce(
    ({ inputs, outputs }, block) => {
      const blockType = (blockTypes || []).find(
        (blockType) => blockType.type === block.type,
      );
      if (!blockType) return { inputs, outputs };
      const forwardedOutputs = block.forward_outputs
        .map((output) =>
          blockType.outputs.find((outputType) => outputType.name === output),
        )
        .filter(Boolean) as z.TypeOf<typeof IOType>[];

      return {
        inputs: [...inputs, ...nameIO(block.name, blockType.inputs)],
        outputs: [...outputs, ...nameIO(block.name, forwardedOutputs)],
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

export const BlockConfig = z.object({
  name: z.string(),
  forward_outputs: z.array(z.string()),
  opts: z.record(z.string(), z.any()),
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
