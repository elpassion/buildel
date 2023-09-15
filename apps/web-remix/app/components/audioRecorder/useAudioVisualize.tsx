import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { isEqual } from "lodash";
import { assert } from "~/utils/assert";

export interface OptionsType {
  barHeightFactor: number;
  barWidth: number;
  barPositionFactor: number;
}

const BASE_OPTIONS: OptionsType = {
  barWidth: 3,
  barHeightFactor: 1,
  barPositionFactor: 4,
};
interface UseAudioVisualizeProps {
  canvas: RefObject<HTMLCanvasElement>;
  options?: Partial<OptionsType>;
}
export const useAudioVisualize = ({
  canvas,
  options = {},
}: UseAudioVisualizeProps) => {
  const { barHeightFactor, barPositionFactor, ...rest } = {
    ...BASE_OPTIONS,
    ...options,
  };

  const animationFrameRef = useRef<number | null>(null);
  const audioAnalyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<
    MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null
  >(null);
  const audioSourceOriginal = useRef<HTMLAudioElement | MediaStream | null>(
    null
  );
  const [status, setStatus] = useState<"playing" | "paused">("paused");

  const handleClearFrame = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const visualizeAudio = useCallback(() => {
    if (!canvas.current) return console.warn("canvas not provided");
    const canvasContext = canvas.current.getContext("2d");
    function draw() {
      assert(audioAnalyzerRef.current);
      assert(canvas.current);
      assert(canvasContext);

      const frequencyBinCountArray = new Uint8Array(
        audioAnalyzerRef.current.fftSize / 2
      );

      const barCount = canvas.current.width / 2;

      audioAnalyzerRef.current.getByteFrequencyData(frequencyBinCountArray);

      canvasContext.clearRect(
        0,
        0,
        canvas.current.width,
        canvas.current.height
      );
      const centerY = canvas.current.height / 2;

      canvasContext.fillStyle = "orange";

      for (let i = 0; i < barCount; i++) {
        const barPosition = i * barPositionFactor;
        const barWidth = rest.barWidth;
        const barHeight = (frequencyBinCountArray[i] / 6) * barHeightFactor;

        canvasContext.fillRect(
          barPosition,
          centerY - barHeight / 2,
          barWidth,
          barHeight / 2
        );
        canvasContext.fillRect(barPosition, centerY, barWidth, barHeight / 2);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    }
    draw();
  }, [barHeightFactor, barPositionFactor, canvas, rest.barWidth]);

  const clear = useCallback(async () => {
    handleClearFrame();

    audioSourceRef.current?.disconnect();
    audioSourceRef.current = null;

    await audioContextRef.current?.close();
    audioContextRef.current = null;

    audioAnalyzerRef.current?.disconnect();
    audioAnalyzerRef.current = null;
  }, [handleClearFrame]);

  const createMediaAnalyzer = useCallback(
    (source: HTMLAudioElement | MediaStream) => {
      audioContextRef.current = new window.AudioContext();
      audioAnalyzerRef.current = audioContextRef.current.createAnalyser();
      audioAnalyzerRef.current.fftSize = 2048;

      if (isSourceNode(source)) {
        audioSourceRef.current =
          audioContextRef.current.createMediaStreamSource(source);
      } else {
        audioSourceRef.current =
          audioContextRef.current.createMediaElementSource(source);
        audioAnalyzerRef.current.connect(audioContextRef.current.destination);
      }

      audioSourceRef.current.connect(audioAnalyzerRef.current);
    },
    []
  );
  const onAudioListen = useCallback(
    async (source: HTMLAudioElement | MediaStream) => {
      if (typeof window === "undefined") return;

      if (!isEqual(source, audioSourceOriginal.current)) {
        await clear();
        createMediaAnalyzer(source);
      }

      audioSourceOriginal.current = source;
      setStatus("playing");
      visualizeAudio();
    },
    [clear, createMediaAnalyzer, visualizeAudio]
  );

  const onAudioStop = useCallback(() => {
    setStatus("paused");
    handleClearFrame();
  }, [handleClearFrame]);

  useEffect(() => {
    return () => {
      handleClearFrame();
    };
  }, [handleClearFrame]);

  return { onAudioListen, onAudioStop, status, clear };
};

function isSourceNode(
  source: HTMLAudioElement | MediaStream
): source is MediaStream {
  return (source as MediaStream).getTracks !== undefined;
}
