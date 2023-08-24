import React from 'react';
import { Button } from '@elpassion/taco';
import { useRunPipeline } from './RunPipelineProvider';

export const RunPipelineButton: React.FC = () => {
  const { status, stopRun, startRun } = useRunPipeline();

  return (
    <Button
      onClick={status === 'idle' ? startRun : stopRun}
      text={status === 'idle' ? 'Start' : 'Stop'}
      disabled={status === 'starting'}
      size="sm"
    />
  );
};
