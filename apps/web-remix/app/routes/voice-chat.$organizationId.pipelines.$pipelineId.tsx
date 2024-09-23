import React, { useState } from 'react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { Mic } from 'lucide-react';
import invariant from 'tiny-invariant';

import { MediaRecorderState } from '~/components/audioRecorder/AudioRecorder';
import { useAudioRecorder } from '~/components/audioRecorder/useAudioRecorder';
import { publicInterfaceLoader } from '~/components/pages/pipelines/interface/interface.loader.server';
import { loaderBuilder } from '~/utils.server';
import { cn } from '~/utils/cn';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ params, ...rest }, helpers) => {
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.pipelineId, 'pipelineId not found');

    return publicInterfaceLoader({ params, ...rest }, helpers);
  })(args);
}

export default function WebsiteChat() {
  const [status, setStatus] = useState<MediaRecorderState>('inactive');

  const onStart = () => {
    setStatus('recording');
    console.log('START');
  };

  const onStop = () => {
    setStatus('inactive');
    console.log('STOP');
  };

  const { stop, start } = useAudioRecorder({
    onStop: onStop,
    onStart: onStart,
    onChunk: (chunk) => console.log('CHUNK', chunk),
  });

  const startStop = async () => {
    if (status === 'recording') {
      await stop();
    } else {
      await start();
    }
  };

  return (
    <div className="flex justify-center items-center h-[100dvh] w-full bg-secondary">
      VOICE CHAT
      <button
        type="button"
        className={cn(
          'w-6 h-6 flex items-center justify-center bg-primary rounded-md ',
          {
            'text-primary-foreground': status !== 'recording',
            'text-red-500': status === 'recording',
          },
        )}
        onClick={startStop}
      >
        <Mic />
      </button>
    </div>
  );
}
