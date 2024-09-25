import type { IPipelinePublicResponse } from '~/api/pipeline/pipeline.contracts';
import type { MediaRecorderState } from '~/components/audioRecorder/AudioRecorder';

export type VoicechatMuteStatus = 'muted' | 'unmuted';
export type VoicechatRecordingStatus = MediaRecorderState | VoicechatMuteStatus;

export interface VoicechatProps {
  pipeline: IPipelinePublicResponse;
  pipelineId: string;
  organizationId: string;
  alias?: string;
  metadata?: Record<string, unknown>;
}
