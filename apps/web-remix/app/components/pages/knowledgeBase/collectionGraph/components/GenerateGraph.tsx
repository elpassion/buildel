import React from 'react';
import { useFetcher } from '@remix-run/react';

import type { IMemoryGraphState } from '~/components/pages/knowledgeBase/knowledgeBase.types';
import { Button } from '~/components/ui/button';

interface GenerateGraphProps {
  state: IMemoryGraphState;
}

export const GenerateGraph = ({ state }: GenerateGraphProps) => {
  const fetcher = useFetcher();

  const isLoading = state.state !== 'idle';

  const generateGraph = () => {
    if (isLoading) fetcher.submit({}, { method: 'delete' });
    else fetcher.submit({}, { method: 'post' });
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={generateGraph}
      className="pointer-events-auto"
    >
      {isLoading ? 'Generating...' : 'Generate Graph'}
    </Button>
  );
};
