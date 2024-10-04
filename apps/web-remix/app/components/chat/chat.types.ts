import type {
  BuildelRunPipelineConfig,
  BuildelRunRunWebchatConfig,
} from '@buildel/buildel';
import { z } from 'zod';

import type { UsePipelineRunSocketArgs } from '~/components/pages/pipelines/usePipelineRun';

export type MessageRole = 'ai' | 'user';

export interface IMessage {
  id: string;
  role: MessageRole;
  blockName: string;
  outputName: string;
  blockId: string;
  message: string;
  created_at: Date;
  state: 'generating' | 'done';
}

export const chatSize = z.enum(['sm', 'default']);

export type ChatSize = z.TypeOf<typeof chatSize>;

export type WebchatPipelineConfig = BuildelRunPipelineConfig & {
  run_id: number;
  interface_config: BuildelRunRunWebchatConfig;
};

export type MessageTextPayload = {
  message: string;
};

export type IOType = { name: string; type: string };

export type WebchatInterface = 'chat' | 'voice';

export type WebchatRunArgs = {
  metadata?: Record<string, unknown>;
  alias?: string;
  id?: number;
};

export interface WebchatBaseProps {
  defaultInterface?: WebchatInterface;
  size?: ChatSize;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  socketArgs?: UsePipelineRunSocketArgs;
  runArgs?: WebchatRunArgs;
}
