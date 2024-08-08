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
    fetcher.submit({}, { method: 'post' });
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={generateGraph}
      disabled={isLoading}
      isLoading={isLoading}
    >
      {isLoading ? 'Generating...' : 'Generate Graph'}
    </Button>
  );
};
