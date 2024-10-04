import type { WebchatPipelineConfig } from '~/components/chat/chat.types';

export function isAudioConfigured(pipeline: WebchatPipelineConfig) {
  if (
    !pipeline.interface_config.audio_inputs ||
    !pipeline.interface_config.audio_outputs
  ) {
    return false;
  }

  return (
    pipeline.interface_config.audio_inputs.length > 0 &&
    pipeline.interface_config.audio_outputs.length > 0
  );
}
