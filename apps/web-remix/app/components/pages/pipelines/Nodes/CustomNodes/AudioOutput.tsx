import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

import { useAudioVisualize } from '~/components/audioRecorder/useAudioVisualize';
import type { IEvent } from '~/components/pages/pipelines/RunPipelineProvider';
import { errorToast } from '~/components/toasts/errorToast';
import { assert } from '~/utils/assert';
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
  const latestTakenIndex = useRef<number>(-1);

  const [isPlaying, setIsPlaying] = useState(false);
  const { visualizeAudio, clearCanvas } = useAudioVisualize(canvasRef);

  useEffect(() => {
    if (!audioRef.current) return;

    const mediaSource = new MediaSource();
    mediaSourceRef.current = mediaSource;

    audioRef.current.src = URL.createObjectURL(mediaSource);

    const visualize = () => {
      assert(audioRef.current);
      visualizeAudio(audioRef.current);
    };

    const onSourceOpen = async () => {
      if (!mediaSourceRef.current) return;

      sourceBufferRef.current =
        mediaSourceRef.current.addSourceBuffer('audio/mpeg');

      sourceBufferRef.current?.addEventListener('updateend', visualize);
    };

    mediaSource.addEventListener('sourceopen', onSourceOpen);

    return () => {
      mediaSource.removeEventListener('sourceopen', onSourceOpen);
      sourceBufferRef.current?.removeEventListener('updateend', visualize);
    };
  }, []);

  const processAudioEvents = (audioEvents: IEvent[]) => {
    if (!sourceBufferRef.current || !mediaSourceRef.current) return;

    for (
      let index = latestTakenIndex.current + 1;
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
          latestTakenIndex.current = index;

          if (audioRef.current && !disabled) {
            audioRef.current.play();

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
    if (disabled) return;

    if (events.length < latestTakenIndex.current) {
      latestTakenIndex.current = -1;
    }

    const id = setInterval(() => {
      processAudioEvents(events);
    }, 150);

    return () => {
      clearInterval(id);
      if (sourceBufferRef.current) {
        sourceBufferRef.current.abort();
      }
    };
  }, [events, disabled]);

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
