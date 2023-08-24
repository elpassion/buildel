'use client';
import { useRef, useState } from 'react';
import {
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Channel, Socket } from 'phoenix';
import { z } from 'zod';
import { ENV } from '~/env.mjs';
import { blockTypesApi } from '~/modules/Pipelines/BlockTypesApi';
import { pipelineApi } from '~/modules/Pipelines/PipelineApi';
import {
  BlockConfig,
  BlocksIO,
  IBlockTypesObj,
  IOType,
  IPipeline,
  Pipeline,
  PipelineResponse,
  PipelinesResponse,
} from '~/modules/Pipelines/pipelines.types';
import { assert } from '~/utils/assert';

export function usePipelines() {
  return useQuery(['pipelines'], async () => {
    const response = await fetch(`${ENV.API_URL}/pipelines`);
    const json = response.json();
    return PipelinesResponse.parse(json).data;
  });
}

export function usePipeline(
  pipelineId: string,
  options?: UseQueryOptions<IPipeline>,
) {
  return useQuery<IPipeline>(
    ['pipelines', pipelineId],
    () => pipelineApi.getPipeline(pipelineId),
    {
      ...options,
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
      return pipelineResponse;
    },
  });
}

export function useBlockTypes(options?: UseQueryOptions<IBlockTypesObj>) {
  return useQuery<IBlockTypesObj>(['blockTypes'], blockTypesApi.getBlockTypes, {
    ...options,
    initialData: options?.initialData ?? {},
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

  if (!pipeline) throw new Error('FIX THIS');

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
