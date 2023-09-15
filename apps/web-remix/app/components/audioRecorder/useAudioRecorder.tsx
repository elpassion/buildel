import { useCallback, useRef, useState } from "react";

export interface UseAudioRecorderCbOptions {
  mediaStream: MediaStream | null;
}
export interface UseAudioRecorderProps {
  onChunk?: (chunk: Blob, options: UseAudioRecorderCbOptions) => void;
  onStop?: (e: Event, options: UseAudioRecorderCbOptions) => void;
  onStart?: (e: Event, options: UseAudioRecorderCbOptions) => void;
  onPause?: (e: Event, options: UseAudioRecorderCbOptions) => void;
}

export type MediaRecorderState = "inactive" | "recording" | "paused";
export const useAudioRecorder = (props?: UseAudioRecorderProps) => {
  const [status, setStatus] = useState<MediaRecorderState>("inactive");
  const mediaStream = useRef<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const requestPermissions = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (navigator?.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });

        mediaStream.current = stream;

        const recorder = new MediaRecorder(stream);

        recorder.onstart = async (e) => {
          props?.onStart?.(e, { mediaStream: stream });
        };

        recorder.onstop = (e) => {
          props?.onStop?.(e, { mediaStream: stream });
        };

        recorder.onpause = (e) => {
          props?.onPause?.(e, { mediaStream: stream });
        };

        recorder.ondataavailable = async (e) => {
          props?.onChunk?.(e.data, { mediaStream: stream });
        };

        mediaRecorder.current = recorder;
      } catch (err) {
        console.log(err);
      }
    } else {
      console.error("getUserMedia not supported!");
    }
  }, [props]);

  const startRecording = useCallback(async () => {
    await requestPermissions();

    if (!mediaRecorder.current) return;

    mediaRecorder.current.start(500);

    setStatus("recording");
  }, [requestPermissions]);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorder.current) return;
    setStatus("inactive");

    mediaRecorder.current.stop();

    mediaStream.current?.getAudioTracks().forEach((track) => track.stop());
  }, []);

  return {
    status,
    start: startRecording,
    stop: stopRecording,
    stream: mediaStream.current,
  };
};
