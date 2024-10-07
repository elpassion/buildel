import { useMemo, useReducer } from 'react';
import type {
  BuildelRunOutputMetadata,
  BuildelRunPipelineConfig,
  BuildelRunRunConfig,
} from '@buildel/buildel';

import type { UsePipelineRunSocketArgs } from '~/components/pages/pipelines/usePipelineRun';
import { usePipelineRun } from '~/components/pages/pipelines/usePipelineRun';

import {
  chatReducer,
  connect,
  error,
  getBlockId,
  messageReceive,
  send,
  statusChange,
} from './chat.reducer';
import type {
  IMessage,
  MessageTextPayload,
  WebchatPipelineConfig,
} from './chat.types';

interface UseChatProps {
  organizationId: number;
  pipelineId: number;
  onBlockOutput?: (
    blockId: string,
    outputName: string,
    payload: unknown,
    metadata: BuildelRunOutputMetadata,
  ) => void;
  onFinish?: () => void;
  onBlockStatusChange?: (blockId: string, isWorking: boolean) => void;
  socketArgs?: UsePipelineRunSocketArgs;
}

export const useChat = ({
  organizationId,
  pipelineId,
  onBlockOutput: onBlockOutputProps,
  onFinish,
  onBlockStatusChange,
  socketArgs,
}: UseChatProps) => {
  const [state, dispatch] = useReducer(chatReducer, {
    status: 'loading',
    pipelineConfig: null,
    error: null,
    messages: [],
    outputsStatus: {},
  });

  const useAuthWithDefault = socketArgs?.useAuth ?? true;

  const onBlockOutput = (
    blockName: string,
    outputName: string,
    payload: unknown,
    metadata: BuildelRunOutputMetadata,
  ) => {
    onBlockOutputProps?.(blockName, outputName, payload, metadata);

    dispatch(
      messageReceive(
        blockName,
        outputName,
        (payload as MessageTextPayload).message,
        metadata,
      ),
    );
  };

  const onStatusChange = (blockName: string, isWorking: boolean) => {
    onBlockStatusChange?.(blockName, isWorking);

    dispatch(statusChange(blockName, isWorking));

    if (Object.values(state.outputsStatus).every((v) => v === 'idle')) {
      onFinish?.();
    }
  };

  const onBlockError = (blockId: string, errors: string[]) => {
    console.error(blockId, errors);
    // dispatch(error());
  };

  const onError = (err: string) => {
    dispatch(error(err));
  };

  const onConnect = (
    { id: run_id, ...run }: BuildelRunRunConfig,
    pipeline: BuildelRunPipelineConfig,
  ) => {
    dispatch(connect({ ...pipeline, ...run, run_id } as WebchatPipelineConfig));

    setTimeout(() => {
      loadHistory();
    }, 0);
  };

  const { startRun, stopRun, push, joinRun, status, loadHistory } =
    usePipelineRun({
      onBlockStatusChange: onStatusChange,
      onConnect,
      organizationId,
      pipelineId,
      onBlockOutput,
      onBlockError,
      onError,
      socketArgs: {
        ...socketArgs,
        useAuth: useAuthWithDefault,
      },
    });

  const handlePush = (message: string) => {
    if (!message.trim() || !state.pipelineConfig) return;
    if (state.pipelineConfig.interface_config.inputs.length === 0) return;

    const { inputs: mentionInputs, text } = retrieveInputsFromMessage(message);

    const baseMessage = {
      blockId: getBlockId(
        state.pipelineConfig.interface_config.inputs[0].name,
        'input',
      ),
      message: text,
    };

    const messages: (typeof baseMessage)[] = [];

    if (mentionInputs.length === 0) {
      messages.push(baseMessage);
    } else {
      mentionInputs.forEach((mention) => {
        if (
          state
            .pipelineConfig!.interface_config.inputs.map((input) => input.name)
            .includes(mention)
        ) {
          messages.push({
            blockId: getBlockId(mention, 'input'),
            message: text,
          });
        } else {
          messages.push(baseMessage);
        }
      });
    }

    messages.forEach((message) => {
      push(message.blockId, message.message);
    });

    dispatch(send());
  };

  const latestAiMessage = useMemo(() => {
    return getLatestAiMessage(state.messages);
  }, [state.messages]);

  const isGenerating = useMemo(() => {
    return (
      state.status === 'generating' ||
      Object.values(state.outputsStatus).some((v) => v === 'generating')
    );
  }, [state.status, state.outputsStatus]);

  const isLoading = useMemo(() => {
    return state.status === 'loading';
  }, [state.status]);

  const isError = useMemo(() => {
    return state.status === 'errored';
  }, [state.status]);

  return {
    push,
    isError,
    error: state.error,
    stopRun,
    startRun,
    joinRun,
    isLoading,
    isGenerating,
    latestAiMessage,
    pipeline: state.pipelineConfig,
    messages: state.messages,
    connectionStatus: status,
    pushMessage: handlePush,
    status: state.status,
  };
};

function retrieveInputsFromMessage(message: string): {
  inputs: string[];
  text: string;
} {
  const regex = /(@\S+)/g;
  return {
    inputs: Array.from(message.matchAll(regex)).map((match) =>
      match[1].replace('@', ''),
    ),
    text: message.replace(regex, '').trim(),
  };
}

function getLatestAiMessage(messages: IMessage[]) {
  return ([] as IMessage[])
    .concat(messages)
    .reverse()
    .find((msg) => msg.role === 'ai');
}
