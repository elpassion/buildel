import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CirclePause, Mic } from 'lucide-react';

import type {
  UseAudioRecorderCb,
  UseAudioRecorderProps,
} from '~/components/audioRecorder/useAudioRecorder';
import { useAudioRecorder } from '~/components/audioRecorder/useAudioRecorder';
import { useAudioVisualize } from '~/components/audioRecorder/useAudioVisualize';
import { cn } from '~/utils/cn';

export type MediaRecorderState = 'inactive' | 'recording';

interface AudioRecorderProps extends UseAudioRecorderProps {
  onClear?: () => void;
  audioOptions?: BlobPropertyBag;
  disabled?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onStart,
  onPause,
  onChunk,
  onStop,
  onClear,
  onError,
  onResume,
  audioOptions,
  disabled,
}) => {
  const [status, setStatus] = useState<MediaRecorderState>('inactive');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);

  const { visualizeAudio, stopVisualization, disconnectSources } =
    useAudioVisualize(canvasRef);

  const handleOnStop: UseAudioRecorderCb = useCallback(
    (e, chunks, args) => {
      onStop?.(e, chunks, args);

      const blob = new Blob(chunks, { type: 'audio/mp3;', ...audioOptions });
      setAudioUrl(URL.createObjectURL(blob));

      stopVisualization();
    },
    [onStop, audioOptions, stopVisualization],
  );

  const handleClear = useCallback(async () => {
    onClear?.();
    setStatus('inactive');
    setAudioUrl(undefined);

    await disconnectSources();
    stopVisualization();
  }, [disconnectSources, stopVisualization, onClear]);

  const handleOnStart: UseAudioRecorderCb = useCallback(
    async (e, chunks, args) => {
      onStart?.(e, chunks, args);

      if (!args.mediaStream) return;

      await visualizeAudio(args.mediaStream);
      setStatus('recording');
    },
    [handleClear, visualizeAudio, onStart],
  );

  useEffect(() => {
    if (disabled) {
      handleClear();
    }
  }, [disabled]);

  const { stop, start } = useAudioRecorder({
    onStop: handleOnStop,
    onStart: handleOnStart,
    onChunk,
    onPause,
    onError,
    onResume,
  });

  const ButtonIcon = useCallback(() => {
    if (status === 'recording') return <CirclePause className="w-4 h-4" />;

    return <Mic className="w-4 h-4" />;
  }, [status]);

  const handleRecord = useCallback(async () => {
    if (status === 'recording') {
      await stop();
      handleClear();
    } else {
      await start();
    }
  }, [status, stop, handleClear, start]);

  return (
    <div className="flex gap-2 items-center bg-muted rounded-lg w-fit px-2 py-1">
      <audio key={audioUrl} src={audioUrl} ref={audioRef} controls hidden />

      <button
        disabled={disabled}
        type="button"
        className={cn(
          'w-6 h-6 flex items-center justify-center bg-primary rounded-md ',
          {
            'text-primary-foreground': status !== 'recording',
            'text-red-500': status === 'recording',
            'hover:bg-primary/90': !disabled,
            'opacity-50': disabled,
          },
        )}
        onClick={handleRecord}
      >
        <ButtonIcon />
      </button>

      <div
        className={cn(
          'relative after:absolute after:w-full after:h-[0.1px] after:bg-primary/30 after:top-1/2 after:left-0 after:right-0 after:-translate-y-1/2',
          {
            "after:content-['']": status === 'inactive',
            'after:content-none': status !== 'inactive',
          },
        )}
      >
        <canvas ref={canvasRef} width={235} height={36} />
      </div>
    </div>
  );
};
