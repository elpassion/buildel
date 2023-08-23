'use client';
import React from 'react';
import { Button } from '@elpassion/taco';
interface PipelineHeaderProps {
  isUpdating?: boolean;
  onSave?: () => void;
}

export const PipelineHeader: React.FC<PipelineHeaderProps> = ({
  isUpdating,
  onSave,
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outlined"
        onClick={onSave}
        text={isUpdating ? 'Saving' : 'Save'}
        size="sm"
      />
      <Button onClick={() => console.log('Run')} text="Play" size="sm" />
    </div>
  );
};
