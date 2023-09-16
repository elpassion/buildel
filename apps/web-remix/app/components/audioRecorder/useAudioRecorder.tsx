import { useCallback, useRef } from "react";

export interface UseAudioRecorderCbOptions {
  mediaStream: MediaStream | null;
  mediaRecorder: MediaRecorder | null;
}

export interface UseAudioRecorderErrorCbOptions
  extends UseAudioRecorderCbOptions {
  error?: unknown;
}

export type UseAudioRecorderCb = (
  e: Event,
  chunks: Blob[],
  args: UseAudioRecorderCbOptions
) => void;

export type UseAudioRecorderErrorCb = (
  e: Event,
  args: UseAudioRecorderErrorCbOptions
) => void;

export type UseAudioRecorderChunkCb = (
  e: BlobEvent,
  args: UseAudioRecorderCbOptions
) => void;
export interface UseAudioRecorderProps {
  onChunk?: UseAudioRecorderChunkCb;
  onError?: UseAudioRecorderErrorCb;
  onStop?: UseAudioRecorderCb;
  onStart?: UseAudioRecorderCb;
  onPause?: UseAudioRecorderCb;
  onResume?: UseAudioRecorderCb;
}

export const useAudioRecorder = (props?: UseAudioRecorderProps) => {
  const chunks = useRef<Blob[]>([]);
  const mediaStream = useRef<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const requestPermissions = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!navigator.mediaDevices) {
      console.error("MediaDevices not supported");
      props?.onError?.(new Event("MediaDevices not supported"), {
        error: new Error("MediaDevices not supported"),
        mediaStream: mediaStream.current,
        mediaRecorder: mediaRecorder.current,
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      mediaStream.current = stream;

      const recorder = new MediaRecorder(stream);

      recorder.onstart = async (e) => {
        props?.onStart?.(e, chunks.current, {
          mediaStream: stream,
          mediaRecorder: recorder,
        });
      };

      recorder.onstop = (e) => {
        props?.onStop?.(e, chunks.current, {
          mediaStream: stream,
          mediaRecorder: recorder,
        });
      };

      recorder.onpause = (e) => {
        props?.onPause?.(e, chunks.current, {
          mediaStream: stream,
          mediaRecorder: recorder,
        });
      };

      recorder.onerror = (e) => {
        props?.onError?.(e, {
          mediaStream: stream,
          mediaRecorder: recorder,
          error: new Error("An error occurred while recording"),
        });
      };

      recorder.onresume = (e) => {
        props?.onResume?.(e, chunks.current, {
          mediaStream: stream,
          mediaRecorder: recorder,
        });
      };

      recorder.ondataavailable = async (e) => {
        chunks.current.push(e.data);
        props?.onChunk?.(e, {
          mediaStream: stream,
          mediaRecorder: recorder,
        });
      };

      mediaRecorder.current = recorder;
    } catch (err) {
      console.error(err);
      props?.onError?.(new Event("error occurred"), {
        mediaStream: mediaStream.current,
        mediaRecorder: mediaRecorder.current,
      });
    }
  }, [props]);

  const startRecording = useCallback(async () => {
    chunks.current = [];

    await requestPermissions();

    if (!mediaRecorder.current) return;

    mediaRecorder.current.start(500);
  }, [requestPermissions]);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorder.current) return;

    mediaRecorder.current.stop();

    mediaStream.current?.getAudioTracks().forEach((track) => track.stop());
  }, []);

  return {
    start: startRecording,
    stop: stopRecording,
    stream: mediaStream.current,
  };
};
