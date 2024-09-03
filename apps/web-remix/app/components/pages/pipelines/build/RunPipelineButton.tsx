import React from 'react';
import { useEventListener } from 'usehooks-ts';

import { errorToast } from '~/components/toasts/errorToast';
import { Button } from '~/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
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

  useEventListener('keydown', (e) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    if (
      e.target instanceof HTMLElement &&
      e.target.classList.contains('tiptap')
    ) {
      return;
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === 'enter' || e.key === 'Enter')) {
      handleRun();
    }
  });

  const isRunning = status !== 'idle';

  return (
    <div className="flex items-center gap-2 pointer-events-auto">
      <TooltipProvider>
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              id="run-workflow"
              aria-label={isRunning ? 'Stop workflow' : 'Start workflow'}
              onClick={handleRun}
              size="xxs"
              variant={isRunning ? 'destructive' : 'default'}
            >
              <div className="flex gap-1 items-center">
                {isRunning ? 'Stop' : 'Start'}
                {status === 'idle' && <PlayFilled className="w-3 h-3" />}
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-[400px]" side="bottom">
            cmd + Enter
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
