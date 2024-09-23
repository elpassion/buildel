import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

import { useAudioVisualize } from '~/components/audioRecorder/useAudioVisualize';
import { errorToast } from '~/components/toasts/errorToast';
import { cn } from '~/utils/cn';

interface AudioOutputProps {
  audio?: string | null;
}

export const AudioOutput: React.FC<AudioOutputProps> = ({ audio }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { visualizeAudio, stopVisualization, clearCanvas } =
    useAudioVisualize(canvasRef);

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

  const handleEnd = () => {
    setIsPlaying(false);
  };

  const handleReset = async () => {
    if (!audioRef.current) return;

    if (!audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    audioRef.current.currentTime = 0;
    stopVisualization();
    clearCanvas();
  };

  useEffect(() => {
    const id = setTimeout(() => {
      handlePlay();
    }, 500);

    return () => {
      clearTimeout(id);
    };
  }, [audio]);

  const isDisabled = !audio;

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        disabled={isDisabled}
        onClick={handleReset}
        className={cn('text-xs text-muted-foreground', {
          'hover:text-foreground': !isDisabled,
          'opacity-50': isDisabled,
        })}
      >
        Back to beginning
      </button>

      <div className="bg-muted rounded-lg flex gap-2 items-center px-2 py-1">
        {audio && (
          <audio
            // key={audio}
            src={audio}
            ref={audioRef}
            onEnded={handleEnd}
            controls
            hidden
          />
        )}

        <button
          type="button"
          className={cn(
            'w-6 h-6 flex items-center justify-center bg-primary rounded-md text-primary-foreground',
            {
              'text-red-500': isPlaying,
              'opacity-50': isDisabled,
            },
          )}
          disabled={isDisabled}
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
            "relative after:absolute after:content-[''] after:w-full after:h-[0.5px] after:bg-primary after:top-1/2 after:left-0 after:right-0 after:-translate-y-1/2",
          )}
        >
          <canvas ref={canvasRef} width={235} height={36} />
        </div>
      </div>
    </div>
  );
};
