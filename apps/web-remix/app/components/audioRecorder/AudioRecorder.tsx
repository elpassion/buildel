import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Icon } from "@elpassion/taco";
import classNames from "classnames";
import { useAudioVisualize } from "~/components/audioRecorder/useAudioVisualize";
import {
  useAudioRecorder,
  UseAudioRecorderCb,
  UseAudioRecorderProps,
} from "~/components/audioRecorder/useAudioRecorder";

export type MediaRecorderState =
  | "inactive"
  | "recording"
  | "paused"
  | "playing";
interface AudioRecorderProps extends UseAudioRecorderProps {
  audioUrl?: string;
  onClear?: () => void;
  onStatusChange?: (status: MediaRecorderState) => void;
  audioOptions?: BlobPropertyBag;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onStart,
  onPause,
  onChunk,
  onStop,
  onClear,
  onError,
  onResume,
  onStatusChange,
  audioOptions,
  audioUrl: audioFromProps,
}) => {
  const [status, setStatus] = useState<MediaRecorderState>("inactive");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);

  const isControlled = typeof audioFromProps !== "undefined";

  const audioValue = useMemo(() => {
    return isControlled ? audioFromProps : audioUrl;
  }, [audioFromProps, audioUrl, isControlled]);

  const { visualizeAudio, stopVisualization, disconnectSources } =
    useAudioVisualize(canvasRef);

  const handleOnStop: UseAudioRecorderCb = useCallback(
    (e, chunks, args) => {
      onStop?.(e, chunks, args);

      if (!isControlled) {
        const blob = new Blob(chunks, { type: "audio/mp3;", ...audioOptions });
        setAudioUrl(URL.createObjectURL(blob));
      }

      stopVisualization();
      setStatus("paused");
    },
    [isControlled, stopVisualization, onStop]
  );

  const handleClear = useCallback(async () => {
    onClear?.();
    setStatus("inactive");
    setAudioUrl(undefined);

    await disconnectSources();
    stopVisualization();
  }, [disconnectSources, stopVisualization, onClear]);

  const handleOnStart: UseAudioRecorderCb = useCallback(
    async (e, chunks, args) => {
      onStart?.(e, chunks, args);

      await handleClear();
      if (!args.mediaStream) return;

      await visualizeAudio(args.mediaStream);
      setStatus("recording");
    },
    [handleClear, visualizeAudio, onStart]
  );

  const { stop, start } = useAudioRecorder({
    onStop: handleOnStop,
    onStart: handleOnStart,
    onChunk,
    onPause,
    onError,
    onResume,
  });

  const ButtonIcon = useCallback(() => {
    if (audioValue && status === "playing")
      return <Icon iconName="pause" size="xs" />;
    if (audioValue && status === "paused")
      return <Icon iconName="play" size="xs" />;

    return <Icon iconName="mic" size="xs" />;
  }, [audioValue, status]);

  const playAudio = useCallback(async () => {
    if (!canvasRef.current || !audioRef.current) return;
    await visualizeAudio(audioRef.current);
    audioRef.current.play();
    setStatus("playing");
  }, [visualizeAudio]);

  const pauseAudio = useCallback(() => {
    audioRef.current?.pause();
    stopVisualization();
    setStatus("paused");
  }, [stopVisualization]);

  const handlePlay = useCallback(async () => {
    if (status === "playing" || !audioValue) {
      pauseAudio();
    } else {
      await playAudio();
    }
  }, [pauseAudio, playAudio, status, audioValue]);

  const handleRecord = useCallback(async () => {
    if (status === "recording") {
      await stop();
    } else {
      await start();
    }
  }, [status, start, stop]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status]);

  return (
    <div className="flex gap-2 items-center bg-neutral-850 rounded-lg w-fit px-2 py-1">
      <audio
        key={audioValue}
        src={audioValue}
        ref={audioRef}
        onEnded={pauseAudio}
        controls
        hidden
      />

      <button
        type="button"
        className={classNames(
          "w-6 h-6 flex items-center justify-center bg-neutral-500 rounded-md hover:bg-neutral-400",
          {
            "text-neutral-50": status !== "recording",
            "text-red-400": status === "recording",
          }
        )}
        onClick={audioValue ? handlePlay : handleRecord}
      >
        <ButtonIcon />
      </button>

      <div
        className={classNames(
          "relative after:absolute after:w-full after:content-[''] after:h-[1px] after:bg-neutral-400 after:top-1/2 after:left-0 after:right-0 after:-translate-y-1/2"
        )}
      >
        <canvas ref={canvasRef} width={audioUrl ? 178 : 210} height={36} />
      </div>

      {audioValue && (
        <button
          type="button"
          onClick={handleClear}
          className={classNames(
            "w-6 h-6 flex items-center justify-center bg-neutral-500 rounded-md text-red-400 hover:bg-neutral-400"
          )}
        >
          <Icon iconName="trash" size="xs" />
        </button>
      )}
    </div>
  );
};
