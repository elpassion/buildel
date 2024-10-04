import type { WebchatPipelineConfig } from '~/components/chat/chat.types';

export function isAudioConfigured(pipeline: WebchatPipelineConfig) {
  return (
    pipeline.interface_config.audio_inputs.length > 0 &&
    pipeline.interface_config.audio_outputs.length > 0
  );
}

export function isWebchatConfigured(pipeline: WebchatPipelineConfig) {
  return (
    pipeline.interface_config.inputs.length > 0 &&
    pipeline.interface_config.outputs.length > 0
  );
}
