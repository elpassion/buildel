import { useCallback, useRef } from "react";
import { assert } from "ts-utils";
import isError from "lodash.iserror";

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
    assert(navigator.mediaDevices, "MediaDevices not supported");

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
  }, [props]);

  const startRecording = useCallback(async () => {
    try {
      chunks.current = [];

      await requestPermissions();

      assert(mediaRecorder.current, "MediaRecorder not created");
      mediaRecorder.current.start(500);
    } catch (err) {
      console.error(err);

      const errMsg = isError(err)
        ? err.message
        : "Something went wrong during recording";

      props?.onError?.(new Event(errMsg), {
        error: err,
        mediaStream: mediaStream.current,
        mediaRecorder: mediaRecorder.current,
      });
    }
  }, [props, requestPermissions]);

  const stopRecording = useCallback(async () => {
    try {
      assert(mediaRecorder.current, "MediaRecorder not created");

      mediaRecorder.current.stop();
      mediaStream.current?.getAudioTracks().forEach((track) => track.stop());
    } catch (err) {
      console.error(err);

      const errMsg = isError(err)
        ? err.message
        : "Something went wrong during stopping recording";

      props?.onError?.(new Event(errMsg), {
        error: err,
        mediaStream: mediaStream.current,
        mediaRecorder: mediaRecorder.current,
      });
    }
  }, [props]);

  const pauseRecording = useCallback(async () => {
    try {
      assert(mediaRecorder.current, "MediaRecorder not created");

      mediaRecorder.current.pause();
    } catch (err) {
      console.error(err);

      const errMsg = isError(err)
        ? err.message
        : "Something went wrong during pausing recording";

      props?.onError?.(new Event(errMsg), {
        error: err,
        mediaStream: mediaStream.current,
        mediaRecorder: mediaRecorder.current,
      });
    }
  }, [props]);

  const resumeRecording = useCallback(async () => {
    try {
      assert(mediaRecorder.current, "MediaRecorder not created");

      mediaRecorder.current.resume();
    } catch (err) {
      console.error(err);

      const errMsg = isError(err)
        ? err.message
        : "Something went wrong during resuming recording";

      props?.onError?.(new Event(errMsg), {
        error: err,
        mediaStream: mediaStream.current,
        mediaRecorder: mediaRecorder.current,
      });
    }
  }, [props]);

  return {
    start: startRecording,
    stop: stopRecording,
    pause: pauseRecording,
    resume: resumeRecording,
  };
};
