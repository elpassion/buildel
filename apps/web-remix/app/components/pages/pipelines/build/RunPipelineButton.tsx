import React from 'react';
import { useEventListener } from 'usehooks-ts';

import { errorToast } from '~/components/toasts/errorToast';
import { Tooltip } from '~/components/tooltip/Tooltip';
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
      <Button
        id="run-workflow"
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

      <Tooltip
        noArrow
        anchorSelect={`#run-workflow`}
        content="cmd + Enter"
        className="!text-xs max-w-[350px] "
        place="bottom"
      />
    </div>
  );
};
