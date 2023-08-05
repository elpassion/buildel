'use client';

// eslint-disable-next-line import/order
import 'regenerator-runtime/runtime';

import React from 'react';
import classNames from 'classnames';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import { Button, Icon, IconButton, Input } from '@elpassion/taco';
import { useEffectOnce } from '~/utils/hooks';
import { SSE, SSEOptionsMethod } from '~/utils/SSE';

export const TalkToMe = () => {
  // for speech recognition you must be online
  const {
    transcript,
    listening,
    resetTranscript,
    // browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const [isLoading, setIsLoading] = React.useState(false);
  // User prompt text
  const [promptText, setPromptText] = React.useState('');
  // Response from OpenAI
  const [resultText, setResultText] = React.useState('');

  const resultRef = React.useRef<string>();

  const checkMicrophonePermissions = () => {
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

  const handleSend = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (promptText.trim() === '') {
      return;
    }
    setIsLoading(true);
    setResultText('');
    const API_URL = 'https://api.openai.com/v1/completions';
    const data = {
      model: 'text-davinci-003',
      prompt: promptText,
      temperature: 0.75,
      top_p: 0.95,
      max_tokens: 1000,
      stream: true,
      n: 1,
    };

    const source = new SSE(API_URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      method: SSEOptionsMethod.POST,
      payload: JSON.stringify(data),
    });

    source.addEventListener('message', (e: any) => {
      console.log(e);
      if (e.data != '[DONE]') {
        let payload = JSON.parse(e.data);
        let text = payload.choices[0].text;
        if (text != '\n') {
          console.log('Text: ' + text);
          resultRef.current = resultRef.current + text;
          console.log('ResultRef.current: ' + resultRef.current);
          setResultText(resultRef.current as string);
        }
      } else {
        source.close();
      }
    });
    source.addEventListener('readystatechange', (e: any) => {
      if (e.readyState >= 2) {
        setIsLoading(false);
      }
    });

    source.stream();
  };
  const handleReset = () => {
    setPromptText('');
    setResultText('');
    resetTranscript();
  };

  useEffectOnce(() => {
    console.log('effect once');
  });

  React.useEffect(() => {
    resultRef.current = resultText;
  }, [resultText]);

  React.useEffect(() => {
    setPromptText(transcript);
  }, [transcript]);

  return (
    <>
      <div>
        <div>
          <ul className="list-inside list-disc">
            <li>{isMicrophoneAvailable ? 'mic available' : 'mic not there'}</li>
            <li>{listening ? 'listening' : 'not listening'}</li>
          </ul>
        </div>

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
                  // continuous: true,
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

          <Button
            text="Send"
            hierarchy="tertiary"
            disabled={true || promptText.trim() === ''}
            isLoading={isLoading}
            onClick={handleSend}
          />
          <Button
            text="Reset"
            hierarchy="tertiary"
            isLoading={isLoading}
            onClick={handleReset}
          />
        </div>
      </div>

      <div className="mb-4" />

      <div>
        <Button
          text="Read"
          hierarchy="tertiary"
          onClick={() => {
            // https://twitter.com/florian_jue/status/1677009250353287168
            // https://talktomerlin.com/s/audio
            // https://elevenlabs.io/speech-synthesis
            // https://docs.elevenlabs.io/api-reference/quick-start/authentication
            // https://mem.ai/p/YltAcPU8Hr3xVvgVtCV7
            console.log('read text demo');
          }}
        />
      </div>

      {resultText && (
        <>
          <div className="mb-4" />
          <div>
            <p>Results:</p>
            <div className="mb-2" />
            <p>{resultText}</p>
          </div>
        </>
      )}
    </>
  );
};
