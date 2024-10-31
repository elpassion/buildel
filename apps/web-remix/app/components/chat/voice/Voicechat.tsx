import React, { useEffect, useReducer, useRef } from 'react';
import { Headphones, Mic, Pause, X } from 'lucide-react';

import type { UseAudioRecorderCbOptions } from '~/components/audioRecorder/useAudioRecorder';
import { useAudioRecorder } from '~/components/audioRecorder/useAudioRecorder';
import { useAudioVisualize } from '~/components/audioRecorder/useAudioVisualize';
import { ChatHeader, ChatStatus } from '~/components/chat/Chat.components';
import type {
  ChatSize,
  IMessage,
  WebchatPipelineConfig,
  WebchatRunArgs,
} from '~/components/chat/chat.types';
import { ChatHeading } from '~/components/chat/ChatHeading';
import { ChatMarkdown } from '~/components/chat/ChatMarkdown';
import type {
  VoicechatReducerState,
  VoicechatStatus,
} from '~/components/chat/voice/voicechat.reducer';
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
import type { UsePipelineRunSocketArgs } from '~/components/pages/pipelines/usePipelineRun';
import { usePipelineRun } from '~/components/pages/pipelines/usePipelineRun';
import { Button } from '~/components/ui/button';
import type { UseSoundArgs } from '~/hooks/useSound';
import { useSound } from '~/hooks/useSound';
import { assert } from '~/utils/assert';
import { cn } from '~/utils/cn';

interface VoicechatProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  pipeline: WebchatPipelineConfig;
  disabled?: boolean;
  size?: ChatSize;
  transcription?: IMessage;
  socketArgs?: UsePipelineRunSocketArgs;
  runArgs?: WebchatRunArgs;
}

export function Voicechat({
  isOpen,
  onOpen,
  onClose,
  disabled,
  pipeline,
  runArgs,
  size,
  transcription,
  socketArgs,
}: VoicechatProps) {
  const {
    joinRun,
    stopRun,
    startRecording,
    stopRecording,
    restore,
    discard,
    audioRef,
    dotCanvasRef,
    talkingCanvasRef,
    state: audioState,
    connectionStatus,
  } = useVoicechat({
    pipeline,
    audioEnabled: isOpen && !disabled,
    socketArgs,
  });

  const onCloseAudioChat = () => {
    discard();

    onClose();
  };

  const onOpenAudioChat = () => {
    restore();

    onOpen();
  };

  useEffect(() => {
    setTimeout(() => {
      joinRun({
        alias: runArgs?.alias,
        runId: pipeline.run_id,
        initial_inputs: [],
        metadata: {
          ...runArgs?.metadata,
          interface: 'webchat',
        },
      });
    }, 500);

    return () => {
      stopRun();
    };
  }, []);

  useEffect(() => {
    if (isOpen && audioRef.current) {
      audioRef.current.autoplay = true;
    }
  }, []);

  const isDisabled = disabled ?? connectionStatus !== 'running';

  return (
    <>
      <Button
        variant="outline"
        className={cn('p-0 rounded-full shrink-0', {
          'h-[48px] w-[48px]': size === 'default',
          'h-[36px] w-[36px]': size === 'sm',
        })}
        onClick={onOpenAudioChat}
      >
        <Headphones
          className={cn({
            'w-6 h-6': size === 'default',
            'w-5 h-5': size === 'sm',
          })}
        />
      </Button>

      <VoicechateModal isOpen={isOpen}>
        <VoicechatWrapper>
          <ChatHeader className="w-full mb-4 lg:px-4 lg:py-2">
            <ChatHeading>{pipeline.name}</ChatHeading>

            <div className="flex gap-2 items-center">
              <ChatStatus connectionStatus={connectionStatus} />

              <Button
                className="p-0 rounded-full h-6"
                size="xs"
                variant="ghost"
                onClick={onCloseAudioChat}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </ChatHeader>

          <VoicechatDot
            audioRef={audioRef}
            canvasRef={dotCanvasRef}
            transcription={<VoiceChatTranscription message={transcription} />}
          />

          <div className="py-4 px-6">
            <SpeakingRow
              disabled={isDisabled}
              onStop={stopRecording}
              onStart={startRecording}
              canvasRef={talkingCanvasRef}
              status={audioState.status}
            />
          </div>
        </VoicechatWrapper>
      </VoicechateModal>
    </>
  );
}

function VoiceChatTranscription({ message }: { message?: IMessage }) {
  return (
    <div className="max-w-[800px] text-center text-muted-foreground text-sm">
      {message ? <ChatMarkdown>{message.message}</ChatMarkdown> : null}
    </div>
  );
}

interface VoicechateModalProps {
  isOpen: boolean;
}

const VoicechateModal = ({
  isOpen,
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & VoicechateModalProps) => {
  return (
    <div
      className={cn(
        'w-full h-[100dvh] bg-secondary fixed top-0 left-0 right-0 bottom-0 transition-all',
        { 'opacity-0 pointer-events-none': !isOpen },
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

interface VoicechatDotProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  transcription?: React.ReactNode;
}

export function VoicechatDot({
  canvasRef,
  audioRef,
  transcription,
}: VoicechatDotProps) {
  return (
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
  );
}

function VoicechatWrapper({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative flex justify-center flex-col items-center h-[100dvh] w-full bg-secondary pt-3 lg:pt-4',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface SpeakingRowProps {
  status: VoicechatStatus;
  onStop?: () => Promise<void>;
  onStart?: () => Promise<void>;
  disabled?: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
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
        disabled={disabled || isListening}
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
  pipeline: WebchatPipelineConfig;
  audioEnabled?: boolean;
  socketArgs?: UsePipelineRunSocketArgs;
}

export function useVoicechat({
  pipeline,
  audioEnabled = true,
  socketArgs,
}: UseVoicechatProps) {
  const eventsQueue = useRef<ArrayBuffer[]>([]);

  const [state, dispatch] = useReducer(
    voicechatReducer,
    DEFAULT_VOICECHAT_STATE,
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);

  const talkingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isStoppedByUser = useRef(false);

  useVoicechatSound(state, {
    src: '/sounds/toggle.mp3',
  });

  const { canvasRef: dotCanvasRef, visualizeDot } = useVisualizeVoicechatDot();
  const {
    visualizeAudio: visualizeTalking,
    clearCanvas: clearTalkingCanvas,
    stopVisualization: stopTalkingVisualization,
  } = useAudioVisualize(talkingCanvasRef, {
    renderBars: drawCircleBars,
  });

  const onResume = (
    _e: Event,
    _chunks: Blob[],
    args: UseAudioRecorderCbOptions,
  ) => {
    isStoppedByUser.current = false;

    dispatch(record());

    if (!args.mediaStream) return;

    visualizeTalking(args.mediaStream);
  };

  const input = pipeline.interface_config.audio_inputs?.find(
    (input) => input.type === 'audio_input',
  );

  const output = pipeline.interface_config.audio_outputs?.find(
    (input) => input.type === 'audio_output',
  );

  const onBlockOutput = (
    blockId: string,
    outputName: string,
    payload: any,
    metadata: any,
  ) => {
    if (blockId === output?.name) {
      processAudioEvents([
        { block: blockId, output: outputName, payload, metadata },
      ]);
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
          stopOrResume();
        }
      }
    }
  };

  const { joinRun, startRun, stopRun, push, status } = usePipelineRun({
    organizationId: pipeline.organization_id,
    pipelineId: pipeline.id,
    onBlockOutput,
    socketArgs,
  });

  const onAudioChunk = (chunk: BlobEvent) => {
    if (!input) return;

    const topic = `${input.name}:input`;
    push(topic, chunk.data);
  };

  const {
    pause: pauseRecording,
    resume: resumeRecording,
    start: startAudioRecording,
    mediaRecorder,
  } = useAudioRecorder({
    onChunk: onAudioChunk,
    onResume: onResume,
    onStart: onResume,
  });

  const stopRecording = async () => {
    isStoppedByUser.current = true;

    await pauseRecording();

    dispatch(stop());

    stopTalkingVisualization();
    clearTalkingCanvas();
  };

  const stopOrResume = async () => {
    if (!isStoppedByUser.current) {
      resumeRecording();
    } else {
      stopRecording();
    }
  };

  const processAudioEvents = (audioEvents: IEvent[]) => {
    if (!sourceBufferRef.current || !mediaSourceRef.current) return;

    for (const event of audioEvents) {
      const audioChunk = new Uint8Array(event.payload);
      eventsQueue.current.push(audioChunk);
    }
  };

  const appendToBuffer = async () => {
    if (!sourceBufferRef.current || !mediaSourceRef.current) return;

    if (sourceBufferRef.current.updating) return;

    if (eventsQueue.current.length > 0) {
      try {
        const nextChunk = eventsQueue.current.shift();

        if (nextChunk) {
          sourceBufferRef.current.appendBuffer(nextChunk);
          // append to buffer but do not play
          if (!audioEnabled) return;

          setTimeout(async () => {
            if (audioRef.current) {
              if (audioRef.current.readyState === 2) {
                audioRef.current.currentTime =
                  audioRef.current.currentTime + 0.001;
              }

              await audioRef.current.play();
            }
          }, 50);
        }
      } catch (error) {
        console.error('Error appending buffer:', error);
      }
    }
  };

  useEffect(() => {
    const id = setInterval(() => {
      appendToBuffer();
    }, 150);

    return () => {
      clearInterval(id);
    };
  }, [audioEnabled]);

  useEffect(() => {
    if (!audioRef.current) return;

    const mediaSource = new MediaSource();
    mediaSourceRef.current = mediaSource;

    audioRef.current.src = URL.createObjectURL(mediaSource);

    const visualizeDotCanvas = () => {
      assert(audioRef.current, 'Audio ref not found');
      visualizeDot(audioRef.current);
    };

    const onSourceOpen = async () => {
      if (!mediaSourceRef.current) return;

      sourceBufferRef.current =
        mediaSourceRef.current.addSourceBuffer('audio/mpeg');

      sourceBufferRef.current?.addEventListener(
        'updateend',
        visualizeDotCanvas,
      );
    };

    const onTimeUpdate = async () => {
      const buffered = audioRef.current!.buffered;

      if (
        buffered.length > 0 &&
        audioRef.current!.currentTime >=
          buffered.end(buffered.length - 1) - 0.15
      ) {
        stopOrResume();
      }
    };
    mediaSource.addEventListener('sourceopen', onSourceOpen);
    audioRef.current?.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      mediaSource.removeEventListener('sourceopen', onSourceOpen);
      audioRef.current?.removeEventListener('timeupdate', onTimeUpdate);
      sourceBufferRef.current?.removeEventListener(
        'updateend',
        visualizeDotCanvas,
      );
    };
  }, []);

  const startRecording = async () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      await resumeRecording();
    } else {
      await startAudioRecording();
    }
  };

  const onDiscard = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();

    stopRecording();
  };

  const fastForwardToEnd = () => {
    assert(audioRef.current, 'Audio ref not found');

    audioRef.current.currentTime =
      audioRef.current.buffered.length > 0
        ? audioRef.current.buffered.end(audioRef.current.buffered.length - 1)
        : 0;
  };

  const onRestore = () => {
    if (!audioRef.current) return;

    fastForwardToEnd();

    audioRef.current.play();
  };

  return {
    startRecording: startRecording,
    stopRecording: stopRecording,
    discard: onDiscard,
    restore: onRestore,
    state,
    audioRef,
    dotCanvasRef,
    talkingCanvasRef,
    audioOutput: output,
    connectionStatus: status,
    joinRun,
    startRun,
    stopRun,
  };
}

function useVisualizeVoicechatDot() {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { visualizeAudio: visualizeDot } = useAudioVisualize(canvasRef, {
    renderBars: (canvas, ctx, frequencyBinCountArray) =>
      drawChatCircle(canvas, ctx, frequencyBinCountArray, imageRef.current),
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');

    imageRef.current = new Image();
    imageRef.current.src = '/icons/star.svg';

    imageRef.current.onload = () => {
      if (!canvasRef.current || !ctx) return;

      drawChatCircle(
        canvasRef.current,
        ctx,
        new Uint8Array(5),
        imageRef.current,
      );
    };
  }, []);

  return {
    visualizeDot,
    canvasRef: canvasRef,
  };
}

function useVoicechatSound(
  state: VoicechatReducerState,
  soundArgs: UseSoundArgs,
) {
  const prevStateRef = useRef<VoicechatReducerState>(state);

  const { play: playSound } = useSound(soundArgs);

  useEffect(() => {
    if (
      (prevStateRef.current.status === 'listening' &&
        state.status === 'recording') ||
      (prevStateRef.current.status === 'recording' &&
        state.status === 'listening')
    ) {
      playSound();
    }

    prevStateRef.current = state;
  }, [state.status]);
}
