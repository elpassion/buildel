import React from 'react';
import { Button } from '@elpassion/taco';
import { useRunPipeline } from './RunPipelineProvider';

export const RunPipelineButton: React.FC = () => {
  const { status, stopRun, startRun, isValid } = useRunPipeline();

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={status === 'idle' ? startRun : stopRun}
        text={status === 'idle' ? 'Start' : 'Stop'}
        disabled={status === 'starting' || !isValid}
        size="sm"
      />
      {!isValid && (
        <span className="text-xs text-red-500">Invalid pipeline</span>
      )}
    </div>
  );
};
