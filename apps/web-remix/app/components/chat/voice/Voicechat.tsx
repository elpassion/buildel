import React, { useEffect, useReducer, useRef } from 'react';
import { Mic, Pause } from 'lucide-react';

import type { IPipelinePublicResponse } from '~/api/pipeline/pipeline.contracts';
import type {
  UseAudioRecorderCbOptions,
  UseAudioRecorderChunkCb,
} from '~/components/audioRecorder/useAudioRecorder';
import { useAudioRecorder } from '~/components/audioRecorder/useAudioRecorder';
import { useAudioVisualize } from '~/components/audioRecorder/useAudioVisualize';
import type { VoicechatStatus } from '~/components/chat/voice/voicechat.reducer';
import {
  DEFAULT_VOICECHAT_STATE,
  listen,
  record,
  stop,
  voicechatReducer,
} from '~/components/chat/voice/voicechat.reducer';
import {
  drawChatCircle,
  drawCircleBars,
} from '~/components/chat/voice/Voicechat.utils';
import type { IEvent } from '~/components/pages/pipelines/RunPipelineProvider';
import { Button } from '~/components/ui/button';
import { assert } from '~/utils/assert';
import { cn } from '~/utils/cn';

interface VoicechatProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  children?: React.ReactNode;
  transcription?: React.ReactNode;
}

export function Voicechat({
  canvasRef,
  audioRef,
  children,
  transcription,
}: VoicechatProps) {
  return (
    <div className="relative flex justify-center flex-col items-center h-[100dvh] w-full bg-secondary">
      <div
        className={cn('grow flex flex-col  items-center', {
          'justify-end md:justify-center': !!transcription,
          'justify-center': !transcription,
        })}
      >
        <audio ref={audioRef} controls hidden />
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="animate-scale"
        />

        {transcription ? (
          <div className="px-4 h-[150px] overflow-y-auto py-4 md:h-[200px]">
            {transcription}
          </div>
        ) : null}
      </div>

      {children}
    </div>
  );
}

interface SpeakingRowProps {
  status: VoicechatStatus;
  onStop?: () => Promise<void>;
  onStart?: () => Promise<void>;
  disabled?: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export function SpeakingRow({
  status,
  disabled,
  canvasRef,
  onStop,
  onStart,
}: SpeakingRowProps) {
  const isActive = status === 'recording' || status === 'listening';

  const startStop = async () => {
    if (isActive) {
      await onStop?.();
    } else {
      await onStart?.();
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
        {status !== 'inactive' ? <Pause /> : <Mic />}
      </Button>
    </div>
  );
}

interface UseVoicechatProps {
  pipeline: IPipelinePublicResponse;
  onChunk: UseAudioRecorderChunkCb;
}

export function useVoicechat({ pipeline, onChunk }: UseVoicechatProps) {
  const eventsQueue = useRef<ArrayBuffer[]>([]);

  const [state, dispatch] = useReducer(
    voicechatReducer,
    DEFAULT_VOICECHAT_STATE,
  );

  const isStoppedByUser = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const dotCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const talkingCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const onStart = (
    _e: Event,
    _chunks: Blob[],
    args: UseAudioRecorderCbOptions,
  ) => {
    isStoppedByUser.current = false;

    dispatch(record());

    if (!args.mediaStream) return;

    visualizeTalking(args.mediaStream);
  };

  const onResume = () => {
    dispatch(record());
  };

  const {
    pause: pauseRecording,
    resume: resumeRecording,
    start: startAudioRecording,
  } = useAudioRecorder({
    onChunk: onChunk,
    onResume: onResume,
    onStart: onStart,
  });

  const {
    visualizeAudio: visualizeTalking,
    clearCanvas: clearTalkingCanvas,
    stopVisualization: stopTalkingVisualization,
  } = useAudioVisualize(talkingCanvasRef, {
    renderBars: drawCircleBars,
  });

  const { visualizeAudio: visualizeDot } = useAudioVisualize(dotCanvasRef, {
    renderBars: drawChatCircle,
  });

  const input = pipeline.interface_config.webchat.audio_inputs.find(
    (input) => input.type === 'audio_input',
  );

  const output = pipeline.interface_config.webchat.audio_outputs.find(
    (input) => input.type === 'audio_output',
  );
  const onBlockOutput = (blockId: string, outputName: string, payload: any) => {
    if (blockId === output?.name) {
      processAudioEvents([{ block: blockId, output: outputName, payload }]);
    }
    if (blockId === input?.name) {
      if (payload.message === 'muted') {
        dispatch(listen());
        pauseRecording();
      } else {
        if (!audioRef.current) return;
        const buffered = audioRef.current.buffered;

        if (
          buffered.length === 0 ||
          audioRef.current.currentTime >=
            buffered.end(buffered.length - 1) - 0.15
        ) {
          if (!isStoppedByUser.current) {
            resumeRecording();
          }
        }
      }
    }
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
          if (audioRef.current?.paused) return;

          setTimeout(async () => {
            if (audioRef.current) {
              if (audioRef.current.readyState === 2) {
                audioRef.current.currentTime =
                  audioRef.current.currentTime + 0.001;
              }

              await audioRef.current.play();
              await visualizeDot(audioRef.current);
            }
          }, 50);
        }
      } catch (error) {
        console.error('Error appending buffer:', error);
      }
    }
  };

  const drawStaticCircle = () => {
    if (!dotCanvasRef.current) return;

    const canvasContext = dotCanvasRef.current?.getContext('2d');

    if (!canvasContext) return;

    canvasContext.clearRect(
      0,
      0,
      dotCanvasRef.current.width,
      dotCanvasRef.current.height,
    );

    const centerX = dotCanvasRef.current.width / 2;
    const centerY = dotCanvasRef.current.height / 2;

    canvasContext.fillStyle = '#111';
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, 70, 0, Math.PI * 2);
    canvasContext.fill();
  };

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
        if (!isStoppedByUser.current) {
          resumeRecording();
        }
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

  const stopRecording = async () => {
    isStoppedByUser.current = true;

    await pauseRecording();

    dispatch(stop());

    stopTalkingVisualization();
    clearTalkingCanvas();
  };

  const startRecording = async () => {
    await startAudioRecording();
  };

  const onDiscard = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();

    stopRecording();
  };

  const rewindAtEnd = () => {
    assert(audioRef.current, 'Audio ref not found');

    audioRef.current.currentTime =
      audioRef.current.buffered.length > 0
        ? audioRef.current.buffered.end(audioRef.current.buffered.length - 1)
        : 0;
  };

  const onRestore = () => {
    if (!audioRef.current) return;

    rewindAtEnd();

    audioRef.current.play();
  };

  return {
    onBlockOutput,
    startRecording: startRecording,
    stopRecording: stopRecording,
    discard: onDiscard,
    restore: onRestore,
    state,
    audioRef,
    dotCanvasRef,
    talkingCanvasRef,
    audioInput: input,
    audioOutput: output,
    isAudioConfigured: !!input && !!output,
  };
}
