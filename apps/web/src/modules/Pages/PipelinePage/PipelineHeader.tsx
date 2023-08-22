'use client';
import React from 'react';
import { Button } from '@elpassion/taco';
interface PipelineHeaderProps {}

export const PipelineHeader: React.FC<PipelineHeaderProps> = () => {
  return <Button onClick={() => console.log('Run')} text="Play" size="sm" />;
};
