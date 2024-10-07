import { ConnectionState } from "phoenix";

export interface BuildelSocketOptions {
  socketUrl?: string;
  authUrl?: string;
  headers?: Record<string, string>;
  useAuth?: boolean;
  onStatusChange?: (status: ConnectionState) => void;
}

export type BuildelRunStatus = "idle" | "starting" | "running";

export type BuildelRunStartArgs = {
  initial_inputs?: { name: string; value: string }[];
  alias?: string;
  metadata?: Record<string, any>;
};

export type BuildelRunJoinArgs = BuildelRunStartArgs & {
  runId: number;
};

export type BuildelRunLogsConnectionStatus = "idle" | "joining" | "joined";

export type BuildelRunLogsJoinArgs = {
  block_name?: string;
};

export type BuildelRunPipelineConfigProperty = {
  name: string;
  type: string;
};

export type BuildelRunPipelineConfig = {
  id: number;
  name: string;
  organization_id: number;
};

export type BuildelRunRunBaseConfig = {
  inputs: BuildelRunPipelineConfigProperty[];
  outputs: BuildelRunPipelineConfigProperty[];
  public: boolean;
};

export type BuildelRunRunFormConfig = BuildelRunRunBaseConfig;

export type BuildelRunRunWebchatConfig = BuildelRunRunBaseConfig & {
  audio_outputs?: BuildelRunPipelineConfigProperty[];
  audio_inputs?: BuildelRunPipelineConfigProperty[];
  description?: string;
  suggested_messages?: string[];
};

export type BuildelRunRunConfig = {
  id: number;
  interface_config: BuildelRunRunWebchatConfig | BuildelRunRunFormConfig;
};

export type BuildelRunOutputMetadata = {
  created_at?: string;
};

export type HistoryEvent = {
  block: string;
  created_at: string;
  io: string;
};

export type HistoryStartStreamEvent = HistoryEvent & {
  type: "start_stream";
};

export type HistoryStopStreamEvent = HistoryEvent & {
  type: "stop_stream";
};

export type HistoryTextEvent = HistoryEvent & {
  type: "text";
  message: string;
};

export type HistoryBinaryEvent = HistoryEvent & {
  type: "binary";
  message: any;
};

export type BuildelRunHistoryEvent =
  | HistoryStartStreamEvent
  | HistoryStopStreamEvent
  | HistoryTextEvent
  | HistoryBinaryEvent;

export type OnConnect = (
  run: BuildelRunRunConfig,
  pipeline: BuildelRunPipelineConfig,
) => void;

export type OnBlockOutput = (
  blockId: string,
  outputName: string,
  payload: unknown,
  metadata: BuildelRunOutputMetadata,
) => void;

export type OnError = (error: string) => void;

export type OnBlockError = (blockId: string, errors: string[]) => void;

export type OnBlockStatusChange = (blockId: string, isWorking: boolean) => void;

export type OnStatusChange = (status: BuildelRunStatus) => void;

export type OnHistory = (events: BuildelRunHistoryEvent[]) => void;

export type BuildelRunHandlers = {
  onConnect: OnConnect;
  onBlockOutput: OnBlockOutput;
  onError: OnError;
  onBlockError: OnBlockError;
  onBlockStatusChange: OnBlockStatusChange;
  onStatusChange: OnStatusChange;
  onHistory: OnHistory;
};

export type OnLogMessage = (payload: unknown) => void;
export type OnLogStatusChange = (
  status: BuildelRunLogsConnectionStatus,
) => void;

export type BuildelRunLogsHandlers = {
  onMessage: OnLogMessage;
  onLogMessage: OnLogMessage;
  onStatusChange: OnLogStatusChange;
  onError: OnError;
};
