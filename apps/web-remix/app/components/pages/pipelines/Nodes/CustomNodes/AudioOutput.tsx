import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

import { useAudioVisualize } from '~/components/audioRecorder/useAudioVisualize';
import type { IEvent } from '~/components/pages/pipelines/RunPipelineProvider';
import { errorToast } from '~/components/toasts/errorToast';
import { cn } from '~/utils/cn';

interface AudioOutputProps {
  events: IEvent[];
  disabled?: boolean;
}

export const AudioOutput: React.FC<AudioOutputProps> = ({
  events,
  disabled,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const lastIndex = useRef<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const { visualizeAudio, clearCanvas } = useAudioVisualize(canvasRef);

  useEffect(() => {
    if (!audioRef.current) return;

    const mediaSource = new MediaSource();
    mediaSourceRef.current = mediaSource;

    audioRef.current.src = URL.createObjectURL(mediaSource);

    const onSourceOpen = async () => {
      if (!mediaSourceRef.current) return;

      const sourceBuffer = mediaSourceRef.current.addSourceBuffer('audio/mpeg');
      sourceBufferRef.current = sourceBuffer;

      // sourceBuffer.addEventListener('updateend', () => {
      //   if (
      //     mediaSourceRef.current &&
      //     mediaSourceRef.current.readyState === 'open'
      //   ) {
      //     console.log('CLOSE AA');
      //   }
      // });

      processAudioEvents(events);
    };

    mediaSource.addEventListener('sourceopen', onSourceOpen);

    return () => {
      mediaSource.removeEventListener('sourceopen', onSourceOpen);
    };
  }, []);

  const processAudioEvents = (audioEvents: IEvent[]) => {
    if (!sourceBufferRef.current || !mediaSourceRef.current) return;

    for (
      let index = lastIndex.current + 1;
      index < audioEvents.length;
      index++
    ) {
      const event = audioEvents[index];
      const audioChunk = new Uint8Array(event.payload);

      if (
        !sourceBufferRef.current.updating &&
        mediaSourceRef.current.readyState === 'open'
      ) {
        try {
          sourceBufferRef.current.appendBuffer(audioChunk);
          lastIndex.current = index;

          if (audioRef.current && !disabled) {
            audioRef.current.play();
            visualizeAudio(audioRef.current);
            setIsPlaying(true);
          }
        } catch (error) {
          console.error('Error appending buffer:', error);
        }
      }
    }
  };

  const handlePlay = async () => {
    if (!audioRef.current) return;
    try {
      if (audioRef.current.paused) {
        await audioRef.current.play();
        await visualizeAudio(audioRef.current);
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } catch {
      errorToast({ description: 'The element has no supported sources.' });
    }
  };

  useEffect(() => {
    processAudioEvents(events);

    return () => {
      if (sourceBufferRef.current) {
        sourceBufferRef.current.abort();
      }
    };
  }, [events]);

  useEffect(() => {
    if (disabled) {
      audioRef.current?.pause();
      setIsPlaying(false);
      clearCanvas();
    }
  }, [disabled]);

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="bg-muted rounded-lg flex gap-2 items-center px-2 py-1">
        <audio ref={audioRef} controls hidden />

        <button
          type="button"
          className={cn(
            'w-6 h-6 flex items-center justify-center bg-primary rounded-md text-primary-foreground',
            {
              'text-red-500': isPlaying,
              'opacity-50': disabled,
            },
          )}
          disabled={disabled}
          onClick={handlePlay}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
        </button>
        <div
          className={cn(
            'relative after:absolute after:w-full after:h-[0.1px] after:bg-primary/30 after:top-1/2 after:left-0 after:right-0 after:-translate-y-1/2',
            {
              "after:content-['']": !isPlaying,
              'after:content-none': isPlaying,
            },
          )}
        >
          <canvas ref={canvasRef} width={250} height={36} />
        </div>
      </div>
    </div>
  );
};
