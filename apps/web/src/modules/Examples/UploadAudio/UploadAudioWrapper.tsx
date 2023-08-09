import { BlocksProvider } from '~/modules/Blocks';
import { UploadAudioClient } from './UploadAudioClient';

export const UploadAudioWrapper = () => {
  return (
    <BlocksProvider>
      <UploadAudioClient />
    </BlocksProvider>
  );
};
