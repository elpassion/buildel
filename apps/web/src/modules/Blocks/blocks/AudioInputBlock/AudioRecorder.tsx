'use client';

import React from 'react';
import { Icon } from '@elpassion/taco';
import { useBlocks } from '~/modules/Blocks';
import { useEffectOnce } from '~/utils/hooks';

// https://blog.logrocket.com/how-to-create-video-audio-recorder-react/
// https://github.com/codiini/react-audio-video-recorder/blob/main/src/AudioRecorder.jsx

// TODO (hub33k): handle situation when user rejected audio permissions
// TODO (hub33k): when adding AudioRecorder it looks like chrome is recording (check tab icon)

const mimeType = 'audio/webm';

export const AudioRecorder = () => {
  const [{ channel }, dispatch] = useBlocks();

  const [isPermitted, setIsPermitted] = React.useState(false);
  const [recordingStatus, setRecordingStatus] =
    React.useState<RecordingState>('inactive');
  const [mediaStream, setMediaStream] = React.useState<MediaStream | null>(
    null,
  );
  const mediaRecorder = React.useRef<MediaRecorder | null>(null);

  useEffectOnce(() => {
    getMicrophonePermission();

    const res = channel.push('add_block', {
      name: 'audio_input',
      opts: {},
      forward_outputs: [],
    });
    console.log('add_block - audio_input res');
    console.log(res);
  });

  const getMicrophonePermission = async () => {
    if ('MediaRecorder' in window) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setIsPermitted(true);
        setMediaStream(stream);
      } catch (err: any) {
        throw new Error(err.message);
      }
    } else {
      throw new Error(
        'The MediaRecorder API is not supported in your browser.',
      );
    }
  };

  const startRecording = async () => {
    if (!mediaStream) {
      return;
    }
    setRecordingStatus('recording');
    const recorder = new MediaRecorder(mediaStream, { mimeType: mimeType });
    mediaRecorder.current = recorder;
    mediaRecorder.current.start(250);

    mediaRecorder.current.ondataavailable = async (event) => {
      if (typeof event.data === 'undefined') return;
      if (event.data.size === 0) return;
      // console.log(event);
      channel.push('block_input_audio_input', await event.data.arrayBuffer());
    };
  };

  const stopRecording = () => {
    if (!mediaStream || !mediaRecorder.current) {
      return;
    }
    setRecordingStatus('inactive');
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = (event) => {
      // console.log(event);
      setTimeout(() => {
        channel.push('reset_blocks', {});
      }, 1000);
    };
  };

  return (
    <div>
      {isPermitted && recordingStatus === 'inactive' ? (
        <Icon iconName="mic" onClick={startRecording} />
      ) : null}
      {recordingStatus === 'recording' ? (
        <Icon iconName="mic-off" onClick={stopRecording} />
      ) : null}
    </div>
  );
};
