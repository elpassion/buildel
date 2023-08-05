'use client';

import React from 'react';
import classNames from 'classnames';
import 'regenerator-runtime/runtime';
// eslint-disable-next-line
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import { Button, Icon, IconButton, Input } from '@elpassion/taco';

export const TalkToMe = () => {
  // for speech recognition you must be online
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [promptText, setPromptText] = React.useState('');

  React.useEffect(() => {
    setPromptText(transcript);
  }, [transcript]);

  const microphone = () => {
    const permissions = navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    permissions
      .then((stream) => {
        // alert('accepted the permissions');
        console.log(stream);
      })
      .catch((err) => {
        console.log(`${err.name} : ${err.message}`);
      });
  };

  return (
    <>
      <div>
        <div className="flex justify-center">
          <IconButton
            icon={<Icon iconName={listening ? 'circle' : 'mic'} />}
            size="lg"
            className={classNames([
              'cursor-pointer',
              listening && 'bg-red-500 hover:bg-red-600',
            ])}
            onClick={async () => {
              if (listening) {
                await SpeechRecognition.stopListening();
              } else {
                setPromptText('');
                resetTranscript();
                await SpeechRecognition.startListening({
                  continuous: true,
                  language: 'pl-PL',
                });
              }
            }}
          />
        </div>

        <div className="mb-4" />

        <div className="flex flex-wrap gap-4">
          <div className="flex-grow">
            <Input
              id="prompt"
              placeholder="What do you want to know?"
              value={promptText}
              onChange={(e) => {
                setPromptText(e.target.value);
              }}
            />
          </div>
          <Button text="Send" hierarchy="tertiary" />
          <Button
            text="Reset"
            hierarchy="tertiary"
            onClick={() => {
              setPromptText('');
              resetTranscript();
            }}
          />
        </div>
      </div>
    </>
  );
};
