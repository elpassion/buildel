import React, { useCallback, useRef, useState } from "react";
import { Icon } from "@elpassion/taco";
import classNames from "classnames";
import { useAudioVisualize } from "~/components/audioRecorder/useAudioVisualize";
import {
  useAudioRecorder,
  UseAudioRecorderCbOptions,
  UseAudioRecorderProps,
} from "~/components/audioRecorder/useAudioRecorder";
interface AudioRecorderProps extends UseAudioRecorderProps {}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onStart,
  onPause,
  onChunk,
  onStop,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);

  const {
    onAudioListen,
    onAudioStop,
    status: playingStatus,
    clear: clearVisualization,
  } = useAudioVisualize({ canvas: canvasRef });

  const handleRemove = useCallback(async () => {
    setAudioUrl(undefined);
    onAudioStop();
    await clearVisualization();
    chunks.current = [];
  }, [clearVisualization, onAudioStop]);

  const handleOnChunk = useCallback(
    (chunk: Blob, options: UseAudioRecorderCbOptions) => {
      chunks.current.push(chunk);
      onChunk?.(chunk, options);
    },
    [onChunk]
  );

  const handleOnStop = useCallback(
    (e: Event, options: UseAudioRecorderCbOptions) => {
      const blob = new Blob(chunks.current, { type: "audio/mp3;" });
      setAudioUrl(URL.createObjectURL(blob));
      onAudioStop();

      onStop?.(e, options);
    },
    [onAudioStop, onStop]
  );

  const handleOnStart = useCallback(
    async (e: Event, options: UseAudioRecorderCbOptions) => {
      await handleRemove();

      if (!options.mediaStream) return;
      await onAudioListen(options.mediaStream);

      onStart?.(e, options);
    },
    [handleRemove, onAudioListen, onStart]
  );

  const {
    stop,
    start,
    status: recordingStatus,
  } = useAudioRecorder({
    onChunk: handleOnChunk,
    onStop: handleOnStop,
    onStart: handleOnStart,
    onPause,
  });

  const handleRecord = useCallback(async () => {
    if (recordingStatus === "recording") {
      await stop();
    } else {
      await start();
    }
  }, [recordingStatus, start, stop]);

  const ButtonIcon = useCallback(() => {
    if (audioUrl && playingStatus === "playing")
      return <Icon iconName="pause" size="xs" />;
    if (audioUrl && playingStatus === "paused")
      return <Icon iconName="play" size="xs" />;

    return <Icon iconName="mic" size="xs" />;
  }, [audioUrl, playingStatus]);

  const playAudio = useCallback(async () => {
    if (!canvasRef.current || !audioRef.current) return;
    await onAudioListen(audioRef.current);
    audioRef.current.play();
  }, [onAudioListen]);

  const pauseAudio = useCallback(() => {
    audioRef.current?.pause();
    onAudioStop();
  }, [onAudioStop]);

  const handlePlay = useCallback(async () => {
    if (playingStatus === "playing") {
      pauseAudio();
    } else {
      await playAudio();
    }
  }, [pauseAudio, playAudio, playingStatus]);

  return (
    <div className="flex gap-2 items-center bg-neutral-800 rounded-lg w-fit px-2 py-1">
      <audio
        key={audioUrl}
        ref={audioRef}
        src={audioUrl}
        onEnded={pauseAudio}
        hidden
      />

      <button
        className={classNames(
          "w-6 h-6 flex items-center justify-center bg-neutral-500 rounded-md hover:bg-neutral-400",
          {
            "text-neutral-50": recordingStatus !== "recording",
            "text-red-400": recordingStatus === "recording",
          }
        )}
        onClick={audioUrl ? handlePlay : handleRecord}
      >
        <ButtonIcon />
      </button>

      <div
        className={classNames(
          "relative after:absolute after:w-full after:content-[''] after:h-[1px] after:bg-neutral-400 after:top-1/2 after:left-0 after:right-0 after:-translate-y-1/2"
        )}
      >
        <canvas ref={canvasRef} width={audioUrl ? 180 : 210} height={36} />
      </div>

      {audioUrl && (
        <button
          onClick={handleRemove}
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
