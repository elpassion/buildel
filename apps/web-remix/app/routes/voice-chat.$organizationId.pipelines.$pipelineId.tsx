import React, { useEffect, useRef, useState } from 'react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Mic, X } from 'lucide-react';
import invariant from 'tiny-invariant';

import type { MediaRecorderState } from '~/components/audioRecorder/AudioRecorder';
import {
  useAudioRecorder,
  UseAudioRecorderCb,
  UseAudioRecorderCbOptions,
  UseAudioRecorderChunkCb,
} from '~/components/audioRecorder/useAudioRecorder';
import {
  useAudioVisualize,
  useAudioVisualizeCircle,
} from '~/components/audioRecorder/useAudioVisualize';
import { ChatStatus } from '~/components/chat/Chat.components';
import { publicInterfaceLoader } from '~/components/pages/pipelines/interface/interface.loader.server';
import type { IEvent } from '~/components/pages/pipelines/RunPipelineProvider';
import { usePipelineRun } from '~/components/pages/pipelines/usePipelineRun';
import { loaderBuilder } from '~/utils.server';
import { cn } from '~/utils/cn';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ params, ...rest }, helpers) => {
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.pipelineId, 'pipelineId not found');

    return publicInterfaceLoader({ params, ...rest }, helpers);
  })(args);
}

export default function WebsiteChat() {
  const { pipelineId, organizationId, pipeline, alias } =
    useLoaderData<typeof loader>();
  const [status, setStatus] = useState<MediaRecorderState>('inactive');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const { visualizeAudio } = useAudioVisualizeCircle(canvasRef);

  const input = pipeline.interface_config.voice.inputs.find(
    (input) => input.type === 'audio_input',
  );

  const output = pipeline.interface_config.voice.outputs.find(
    (input) => input.type === 'audio_output',
  );

  const onBlockOutput = (blockId: string, outputName: string, payload: any) => {
    if (blockId === output?.name) {
      processAudioEvents([{ block: blockId, output: outputName, payload }]);
    }
  };

  const {
    push,
    startRun,
    stopRun,
    status: runStatus,
  } = usePipelineRun(
    Number(organizationId),
    Number(pipelineId),
    onBlockOutput,
    (a, b) => console.log('STATUS CHANGE', a, b),
    () => {},
    () => {},
    pipeline.interface_config.voice.public,
  );

  const onStart = () => {
    setStatus('recording');
  };

  const onStop = () => {
    setStatus('inactive');
  };

  const onChunk = (chunk: BlobEvent) => {
    if (!input) return;

    const topic = `${input.name}:input`;

    push(topic, chunk.data);
  };

  useEffect(() => {
    setTimeout(() => {
      startRun({
        alias,
        initial_inputs: [],
        metadata: {
          interface: 'voice',
        },
      });
    }, 500);

    return () => {
      stopRun();
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    const mediaSource = new MediaSource();
    mediaSourceRef.current = mediaSource;

    audioRef.current.src = URL.createObjectURL(mediaSource);

    const onSourceOpen = async () => {
      if (!mediaSourceRef.current) return;

      sourceBufferRef.current =
        mediaSourceRef.current.addSourceBuffer('audio/mpeg');
    };

    mediaSource.addEventListener('sourceopen', onSourceOpen);

    return () => {
      mediaSource.removeEventListener('sourceopen', onSourceOpen);
    };
  }, []);

  const processAudioEvents = (audioEvents: IEvent[]) => {
    if (!sourceBufferRef.current || !mediaSourceRef.current) return;

    for (const event of audioEvents) {
      const audioChunk = new Uint8Array(event.payload);
      if (
        !sourceBufferRef.current.updating &&
        mediaSourceRef.current.readyState === 'open'
      ) {
        try {
          sourceBufferRef.current.appendBuffer(audioChunk);

          if (audioRef.current) {
            visualizeAudio(audioRef.current);
          }
        } catch (error) {
          console.error('Error appending buffer:', error);
        }
      }
    }
  };

  return (
    <div className="relative flex justify-center flex-col items-center h-[100dvh] w-full bg-secondary">
      <div className="absolute top-1 right-1">
        <ChatStatus connectionStatus={runStatus} />
      </div>

      <div className="grow flex justify-center items-center">
        <audio ref={audioRef} controls autoPlay hidden />
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="animate-scale"
        />
      </div>

      <div className="py-4 px-6">
        <SpeakingRow
          status={status}
          onStop={onStop}
          onStart={onStart}
          onChunk={onChunk}
        />
      </div>
    </div>
  );
}

interface SpeakingRowProps {
  status: MediaRecorderState;
  onChunk?: UseAudioRecorderChunkCb;
  onStop?: UseAudioRecorderCb;
  onStart?: UseAudioRecorderCb;
}

function SpeakingRow({ status, ...rest }: SpeakingRowProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { visualizeAudio, clearCanvas, stopVisualization } =
    useAudioVisualize(canvasRef);

  const onChunk = (e: BlobEvent, args: UseAudioRecorderCbOptions) => {
    rest.onChunk?.(e, args);
  };

  const onStop = (
    e: Event,
    chunks: Blob[],
    args: UseAudioRecorderCbOptions,
  ) => {
    rest.onStop?.(e, chunks, args);

    stopVisualization();
    clearCanvas();
  };

  const onStart = (e: Event, blob: Blob[], args: UseAudioRecorderCbOptions) => {
    rest.onStart?.(e, blob, args);

    if (!args.mediaStream) return;

    visualizeAudio(args.mediaStream);
  };

  const { stop, start } = useAudioRecorder({
    onChunk: onChunk,
    onStop: onStop,
    onStart: onStart,
  });

  const startStop = async () => {
    if (status === 'recording') {
      await stop();
    } else {
      await start();
    }
  };

  return (
    <div className="flex gap-2 flex-col items-center min-h-[124px] justify-end">
      <canvas
        ref={canvasRef}
        width={100}
        height={36}
        className={cn({ hidden: status !== 'recording' })}
      />

      <button
        type="button"
        onClick={startStop}
        className={cn(
          'w-12 h-12 flex items-center text-white justify-center bg-primary rounded-full ',
          {
            'bg-red-500': status === 'recording',
          },
        )}
      >
        {status === 'recording' ? <X /> : <Mic />}
      </button>
    </div>
  );
}
