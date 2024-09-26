import { IPipelinePublicResponse } from '~/api/pipeline/pipeline.contracts';

export function isAudioConfigured(pipeline: IPipelinePublicResponse) {
  return (
    pipeline.interface_config.webchat.audio_inputs.length > 0 &&
    pipeline.interface_config.webchat.audio_outputs.length > 0
  );
}

export function isWebchatConfigured(pipeline: IPipelinePublicResponse) {
  return (
    pipeline.interface_config.webchat.inputs.length > 0 &&
    pipeline.interface_config.webchat.outputs.length > 0
  );
}
