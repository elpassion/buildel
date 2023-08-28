'use client';

import React from 'react';
import { Icon } from '@elpassion/taco';
import { assert } from '~/utils/assert';

const mimeType = 'audio/*';

interface MicrophoneRecorderProps {
  name: string;
  onStartCallback: (event: BlobEvent) => void;
  onStopCallback?: () => void;
}

export const MicrophoneRecorder = ({
  name,
  onStartCallback,
  onStopCallback,
}: MicrophoneRecorderProps) => {
  const [permission, setPermission] = React.useState(false);
  const [recordingStatus, setRecordingStatus] = React.useState<
    'inactive' | 'recording'
  >('inactive');
  const [mediaStream, setMediaStream] = React.useState<MediaStream | null>(
    null,
  );
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [audioChunks, setAudioChunks] = React.useState<any[]>([]);

  const mediaRecorder = React.useRef<MediaRecorder | null>(null);

  const getMicrophonePermission = async () => {
    if ('MediaRecorder' in window) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setMediaStream(mediaStream);
      } catch (err) {
        // @ts-ignore
        console.error(err.message);
      }
    } else {
      console.warn('The MediaRecorder API is not supported in your browser.');
    }
  };

  const startRecording = async () => {
    assert(mediaStream);
    setRecordingStatus('recording');
    const media = new MediaRecorder(mediaStream);

    mediaRecorder.current = media;
    mediaRecorder.current.start(250);

    // const localAudioChunks: any[] = [];

    mediaRecorder.current.ondataavailable = async (event) => {
      if (typeof event.data === 'undefined') return;
      if (event.data.size === 0) return;
      onStartCallback(event);
      // localAudioChunks.push(event.data);
    };

    // setAudioChunks(localAudioChunks);
  };

  const stopRecording = () => {
    assert(mediaRecorder.current);
    setRecordingStatus('inactive');

    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      onStopCallback && onStopCallback();
      // const audioBlob = new Blob(audioChunks, { type: mimeType });
      // const audioUrl = URL.createObjectURL(audioBlob);

      // setAudioUrl(audioUrl);
      // setAudioChunks([]);
    };
  };

  return (
    <>
      {!permission ? (
        <button onClick={getMicrophonePermission} type="button">
          Get Microphone
        </button>
      ) : null}
      {permission && recordingStatus === 'inactive' ? (
        <Icon
          onClick={startRecording}
          iconName="mic"
          className="cursor-pointer"
        />
      ) : null}
      {recordingStatus === 'recording' ? (
        <Icon
          onClick={stopRecording}
          iconName="mic-off"
          className="cursor-pointer"
        />
      ) : null}

      {audioUrl ? (
        <div>
          <audio src={audioUrl} controls></audio>
          <a download href={audioUrl}>
            Download Recording
          </a>
        </div>
      ) : null}
    </>
  );
};
