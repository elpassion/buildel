import React, { useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import { Icon } from "@elpassion/taco";
import { useAudioVisualize } from "~/components/audioRecorder/useAudioVisualize";
interface AudioOutputProps {
  audio?: Blob | string;
}

export const AudioOutput: React.FC<AudioOutputProps> = ({ audio }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { visualizeAudio, stopVisualization, clearCanvas } =
    useAudioVisualize(canvasRef);

  const handlePlay = async () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      await audioRef.current.play();
      await visualizeAudio(audioRef.current);
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
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

  const audioUrl = useMemo(() => {
    if (!audio) return;
    if (typeof audio === "string") {
      return audio;
    }

    return URL.createObjectURL(audio);
  }, [audio]);

  useEffect(() => {
    if (!audioUrl) return;
    return () => {
      URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const isDisabled = !audioUrl;

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        disabled={isDisabled}
        onClick={handleReset}
        className={classNames("text-xs", {
          "text-neutral-200 hover:text-primary-500": !isDisabled,
          "text-neutral-400": isDisabled,
        })}
      >
        Back to beginning
      </button>

      <div className="bg-neutral-850 rounded-lg flex gap-2 items-center px-2 py-1">
        <audio
          src={audioUrl}
          ref={audioRef}
          onEnded={handleEnd}
          controls
          hidden
        />
        <button
          type="button"
          className={classNames(
            "w-6 h-6 flex items-center justify-center bg-neutral-500 rounded-md",
            {
              "text-neutral-50": !isPlaying && !isDisabled,
              "text-red-400": isPlaying,
              "bg-neutral-700 text-neutral-400": isDisabled,
            }
          )}
          disabled={isDisabled}
          onClick={handlePlay}
        >
          <Icon iconName={isPlaying ? "pause" : "play"} size="xs" />
        </button>
        <div
          className={classNames(
            "relative after:absolute after:content-[''] after:w-full after:h-[1px] after:bg-neutral-400 after:top-1/2 after:left-0 after:right-0 after:-translate-y-1/2"
          )}
        >
          <canvas ref={canvasRef} width={235} height={36} />
        </div>
      </div>
    </div>
  );
};
