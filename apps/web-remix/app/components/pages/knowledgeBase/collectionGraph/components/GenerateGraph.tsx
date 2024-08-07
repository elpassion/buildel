import React from 'react';
import { useFetcher } from '@remix-run/react';

import { Button } from '~/components/ui/button';

export const GenerateGraph = () => {
  const fetcher = useFetcher();

  const isLoading = fetcher.state !== 'idle';

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
