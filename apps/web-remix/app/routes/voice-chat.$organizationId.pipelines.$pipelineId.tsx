import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Mic, X } from 'lucide-react';
import invariant from 'tiny-invariant';

import type { MediaRecorderState } from '~/components/audioRecorder/AudioRecorder';
import type {
  UseAudioRecorderCb,
  UseAudioRecorderCbOptions,
  UseAudioRecorderChunkCb,
} from '~/components/audioRecorder/useAudioRecorder';
import { useAudioRecorder } from '~/components/audioRecorder/useAudioRecorder';
import { useAudioVisualize } from '~/components/audioRecorder/useAudioVisualize';
import { ChatStatus } from '~/components/chat/Chat.components';
import { publicInterfaceLoader } from '~/components/pages/pipelines/interface/interface.loader.server';
import type { IEvent } from '~/components/pages/pipelines/RunPipelineProvider';
import { usePipelineRun } from '~/components/pages/pipelines/usePipelineRun';
import { Button } from '~/components/ui/button';
import { loaderBuilder } from '~/utils.server';
import { cn } from '~/utils/cn';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ params, ...rest }, helpers) => {
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.pipelineId, 'pipelineId not found');

    return publicInterfaceLoader({ params, ...rest }, helpers);
  })(args);
}

type MuteStatus = 'muted' | 'unmuted';
type RecordingStatus = MediaRecorderState | MuteStatus;

export default function WebsiteChat() {
  const { pipelineId, organizationId, pipeline, alias } =
    useLoaderData<typeof loader>();

  const [recordingStatus, setRecordingStatus] =
    useState<MediaRecorderState>('inactive');
  const [mutedStatus, setMutedStatus] = useState<MuteStatus>('unmuted');
  const [isEnd, setIsEnd] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const { visualizeAudio } = useAudioVisualize(canvasRef, {
    renderBars: drawChatCircle,
  });

  const speakingStatus = useMemo(() => {
    if (recordingStatus === 'inactive') return 'inactive';
    if (!isEnd || mutedStatus === 'muted') return 'muted';
    return 'recording';
  }, [recordingStatus, isEnd, mutedStatus]);

  const input = pipeline.interface_config.voice.inputs.find(
    (input) => input.type === 'audio_input',
  );

  const output = pipeline.interface_config.voice.outputs.find(
    (input) => input.type === 'audio_output',
  );

  const onBlockOutput = (blockId: string, outputName: string, payload: any) => {
    if (blockId === output?.name) {
      processAudioEvents([{ block: blockId, output: outputName, payload }]);
      setIsEnd(false);
    }
    if (blockId === input?.name) {
      setMutedStatus(payload.message);
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
    () => {},
    () => {},
    () => {},
    pipeline.interface_config.voice.public,
  );

  const onStart = () => {
    setRecordingStatus('recording');
  };

  const onStop = () => {
    setRecordingStatus('inactive');
  };

  const onChunk = (chunk: BlobEvent) => {
    if (!input) return;

    const topic = `${input.name}:input`;

    push(topic, chunk.data);
  };

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

  const drawStaticCircle = () => {
    if (!canvasRef.current) return;

    const canvasContext = canvasRef.current?.getContext('2d');

    if (!canvasContext) return;

    canvasContext.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    );

    const centerX = canvasRef.current.width / 2;
    const centerY = canvasRef.current.height / 2;

    canvasContext.fillStyle = '#111';
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, 70, 0, Math.PI * 2);
    canvasContext.fill();
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
    drawStaticCircle();

    if (!audioRef.current) return;

    const mediaSource = new MediaSource();
    mediaSourceRef.current = mediaSource;

    audioRef.current.src = URL.createObjectURL(mediaSource);

    const onSourceOpen = async () => {
      if (!mediaSourceRef.current) return;

      sourceBufferRef.current =
        mediaSourceRef.current.addSourceBuffer('audio/mpeg');
    };

    const onTimeUpdate = async () => {
      const buffered = audioRef.current!.buffered;

      if (
        buffered.length > 0 &&
        audioRef.current!.currentTime >=
          buffered.end(buffered.length - 1) - 0.15
      ) {
        setIsEnd(true);
      }
    };

    mediaSource.addEventListener('sourceopen', onSourceOpen);
    audioRef.current?.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      mediaSource.removeEventListener('sourceopen', onSourceOpen);
      audioRef.current?.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, []);

  return (
    <div className="relative flex justify-center flex-col items-center h-[100dvh] w-full bg-secondary">
      <div className="absolute top-3 right-3">
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
          disabled={runStatus !== 'running'}
          status={speakingStatus}
          onStop={onStop}
          onStart={onStart}
          onChunk={onChunk}
        />
      </div>
    </div>
  );
}

interface SpeakingRowProps {
  status: RecordingStatus;
  onChunk?: UseAudioRecorderChunkCb;
  onStop?: UseAudioRecorderCb;
  onStart?: UseAudioRecorderCb;
  disabled?: boolean;
}

function SpeakingRow({ status, disabled, ...rest }: SpeakingRowProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { visualizeAudio, clearCanvas, stopVisualization } = useAudioVisualize(
    canvasRef,
    {
      renderBars: drawCircleBars,
    },
  );

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

  const isRecording = status === 'recording' || status === 'muted';

  const startStop = async () => {
    if (isRecording) {
      await stop();
    } else {
      await start();
    }
  };

  const isMuted = status === 'muted';

  return (
    <div className="flex gap-2 flex-col items-center min-h-[124px] justify-end">
      <div
        className={cn('flex flex-col gap-1 items-center', {
          hidden: status === 'inactive',
        })}
      >
        <div className="relative flex items-end transition-all w-[200px]">
          <Mic
            className={cn(
              'absolute bottom-0 -translate-x-1/2 w-5 h-5 transition-all',
              {
                'left-[calc(50%_-_40px)]': !isMuted,
                'left-1/2 text-gray-400': isMuted,
              },
            )}
          />
          <canvas
            ref={canvasRef}
            width={80}
            height={36}
            className={cn('shrink-0 min-w-[80px] min-h-[36px]', {
              'absolute bottom-0 left-[calc(50%_+_10px)] -translate-x-1/2 w-5 h-5 transition-all':
                !isMuted,
              'opacity-0 pointer-events-none': isMuted,
            })}
          />
        </div>
        <p
          className={cn('text-muted-foreground text-xs transition-all', {
            'pointer-events-none opacity-0': isMuted,
          })}
        >
          Start speaking
        </p>

        {/*<Mic*/}
        {/*  className={cn(*/}
        {/*    'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 transition-opacity',*/}
        {/*    {*/}
        {/*      'opacity-0': status !== 'muted',*/}
        {/*      'opacity-100': status === 'muted',*/}
        {/*    },*/}
        {/*  )}*/}
        {/*/>*/}
      </div>

      <Button
        type="button"
        disabled={disabled}
        onClick={startStop}
        variant={isRecording ? 'destructive' : 'default'}
        className={cn(
          'w-12 h-12 flex items-center text-white justify-center rounded-full p-0',
        )}
      >
        {status !== 'inactive' ? <X /> : <Mic />}
      </Button>
    </div>
  );
}

function drawCircleBars(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  frequencyBinCountArray: Uint8Array,
) {
  const circleCount = 5;
  const barWidth = 15;
  const radius = barWidth / 2;
  const barSpacing = canvas.width / circleCount;

  for (let i = 0; i < circleCount; i++) {
    const barHeight =
      15 + (frequencyBinCountArray[i] / 255) * (canvas.height - 15);

    const x = barSpacing * i + barSpacing / 2 - barWidth / 2;
    const y = canvas.height - barHeight;

    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, canvas.height - radius);
    ctx.quadraticCurveTo(x, canvas.height, x + radius, canvas.height);
    ctx.lineTo(x + barWidth - radius, canvas.height);
    ctx.quadraticCurveTo(
      x + barWidth,
      canvas.height,
      x + barWidth,
      canvas.height - radius,
    );
    ctx.lineTo(x + barWidth, y + radius);
    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth - radius, y);
    ctx.lineTo(x + radius, y);
    ctx.quadraticCurveTo(x, y, x, y + radius);
    ctx.fillStyle = '#111';
    ctx.fill();
  }
}

function drawChatCircle(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  frequencyBinCountArray: Uint8Array,
) {
  const averageFrequency =
    frequencyBinCountArray.reduce((a, b) => a + b, 0) /
    frequencyBinCountArray.length;

  const baseRadius = 70;

  const maxGrowth = canvas.width - baseRadius;
  const radius = baseRadius + (averageFrequency / 255) * maxGrowth;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
}
