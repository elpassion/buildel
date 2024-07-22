import React from 'react';

import { errorToast } from '~/components/toasts/errorToast';
import { Button } from '~/components/ui/button';
import { PlayFilled } from '~/icons/PlayFilled';

import { useRunPipeline } from '../RunPipelineProvider';

export const RunPipelineButton: React.FC = () => {
  const { status, stopRun, startRun, isValid } = useRunPipeline();

  const handleRun = () => {
    if (status === 'idle') {
      if (!isValid) {
        errorToast({
          title: 'Invalid workflow',
          description:
            'We couldn’t run the workflow due to errors in some of your blocks. Please check the highlighted blocks.',
        });
      } else {
        startRun();
      }
    } else {
      stopRun();
    }
  };

  const isRunning = status !== 'idle';

  return (
    <div className="flex items-center gap-2 pointer-events-auto">
      <Button
        aria-label={isRunning ? 'Stop workflow' : 'Start workflow'}
        onClick={handleRun}
        size="xs"
        variant={isRunning ? 'destructive' : 'default'}
      >
        <div className="flex gap-1 items-center">
          {isRunning ? 'Stop' : 'Start'}
          {status === 'idle' && <PlayFilled className="w-3 h-3" />}
        </div>
      </Button>
    </div>
  );
};
