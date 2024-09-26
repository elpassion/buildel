import React, { useEffect, useReducer, useRef } from 'react';
import { Mic, X } from 'lucide-react';

import type {
  UseAudioRecorderCb,
  UseAudioRecorderCbOptions,
  UseAudioRecorderChunkCb,
} from '~/components/audioRecorder/useAudioRecorder';
import { useAudioRecorder } from '~/components/audioRecorder/useAudioRecorder';
import { useAudioVisualize } from '~/components/audioRecorder/useAudioVisualize';
import { ChatStatus } from '~/components/chat/Chat.components';
import type { VoicechatStatus } from '~/components/chat/voice/voicechat.reducer';
import {
  DEFAULT_VOICECHAT_STATE,
  listen,
  record,
  stop,
  voicechatReducer,
} from '~/components/chat/voice/voicechat.reducer';
import type { VoicechatProps } from '~/components/chat/voice/voicechat.types';
import {
  drawChatCircle,
  drawCircleBars,
} from '~/components/chat/voice/Voicechat.utils';
import type { IEvent } from '~/components/pages/pipelines/RunPipelineProvider';
import { usePipelineRun } from '~/components/pages/pipelines/usePipelineRun';
import { Button } from '~/components/ui/button';
import { cn } from '~/utils/cn';

export function Voicechat({
  pipeline,
  pipelineId,
  organizationId,
  alias,
  metadata,
}: VoicechatProps) {
  const eventsQueue = useRef<ArrayBuffer[]>([]);
  const [state, dispatch] = useReducer(
    voicechatReducer,
    DEFAULT_VOICECHAT_STATE,
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const { visualizeAudio } = useAudioVisualize(canvasRef, {
    renderBars: drawChatCircle,
  });

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
    if (blockId === input?.name) {
      if (payload.message === 'muted') {
        dispatch(listen());
      } else {
        if (!audioRef.current) return;
        const buffered = audioRef.current.buffered;

        if (
          buffered.length === 0 ||
          audioRef.current.currentTime >=
            buffered.end(buffered.length - 1) - 0.15
        ) {
          dispatch(record());
        }
      }
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
    dispatch(record());
  };

  const onStop = () => {
    dispatch(stop());
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
      eventsQueue.current.push(audioChunk);
    }

    appendToBuffer();
  };

  const appendToBuffer = async () => {
    if (!sourceBufferRef.current || !mediaSourceRef.current) return;

    if (sourceBufferRef.current.updating) {
      return;
    }

    if (eventsQueue.current.length > 0) {
      try {
        const nextChunk = eventsQueue.current.shift();

        if (nextChunk) {
          sourceBufferRef.current.appendBuffer(nextChunk);

          if (audioRef.current) {
            if (audioRef.current?.readyState === 2) {
              audioRef.current.currentTime =
                audioRef.current.currentTime + 0.001;
            }
            await audioRef.current.play();
            await visualizeAudio(audioRef.current);
          }
        }
      } catch (error) {
        console.error('Error appending buffer:', error);
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
          ...metadata,
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

      sourceBufferRef.current?.addEventListener('updateend', appendToBuffer);
    };

    const onTimeUpdate = async () => {
      const buffered = audioRef.current!.buffered;

      if (
        buffered.length > 0 &&
        audioRef.current!.currentTime >=
          buffered.end(buffered.length - 1) - 0.15
      ) {
        dispatch(record());
      }
    };

    mediaSource.addEventListener('sourceopen', onSourceOpen);
    audioRef.current?.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      mediaSource.removeEventListener('sourceopen', onSourceOpen);
      audioRef.current?.removeEventListener('timeupdate', onTimeUpdate);
      sourceBufferRef.current?.removeEventListener('updateend', appendToBuffer);
    };
  }, []);

  return (
    <div className="relative flex justify-center flex-col items-center h-[100dvh] w-full bg-secondary">
      <div className="absolute top-3 right-3">
        <ChatStatus connectionStatus={runStatus} />
      </div>

      <div className="grow flex justify-center items-center">
        <audio ref={audioRef} controls hidden autoPlay />
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
          status={state.status}
          onStop={onStop}
          onStart={onStart}
          onChunk={onChunk}
        />
      </div>
    </div>
  );
}

interface SpeakingRowProps {
  status: VoicechatStatus;
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

  const isActive = status === 'recording' || status === 'listening';

  const startStop = async () => {
    if (isActive) {
      await stop();
    } else {
      await start();
    }
  };

  const isListening = status === 'listening';

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
                'left-[calc(50%_-_40px)]': !isListening,
                'left-1/2 text-gray-400': isListening,
              },
            )}
          />
          <canvas
            ref={canvasRef}
            width={80}
            height={36}
            className={cn('shrink-0 min-w-[80px] min-h-[36px]', {
              'absolute bottom-0 left-[calc(50%_+_10px)] -translate-x-1/2 w-5 h-5 transition-all':
                !isListening,
              'opacity-0 pointer-events-none': isListening,
            })}
          />
        </div>
        <p
          className={cn('text-muted-foreground text-xs transition-all', {
            'pointer-events-none opacity-0': isListening,
          })}
        >
          Start speaking
        </p>
      </div>

      <Button
        type="button"
        disabled={disabled}
        onClick={startStop}
        variant={isActive ? 'destructive' : 'default'}
        className={cn(
          'w-12 h-12 flex items-center text-white justify-center rounded-full p-0',
        )}
      >
        {status !== 'inactive' ? <X /> : <Mic />}
      </Button>
    </div>
  );
}
