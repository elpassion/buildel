'use client';

import { BlocksProvider } from '~/modules/Blocks';
import { ExampleClient } from './ExampleClient';

export const ExampleWrapper = () => {
  return (
    <BlocksProvider>
      <ExampleClient />
    </BlocksProvider>
  );
};
