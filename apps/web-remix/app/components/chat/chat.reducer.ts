import cloneDeep from 'lodash.clonedeep';
import startCase from 'lodash.startcase';
import { v4 as uuidv4 } from 'uuid';

import type {
  IMessage,
  IOType,
  MessageRole,
  WebchatPipelineConfig,
} from '~/components/chat/chat.types';

type Action =
  | {
      type: 'CONNECT';
      payload: {
        data: WebchatPipelineConfig;
      };
    }
  | {
      type: 'ERROR';
      payload: {
        error: string | null;
      };
    }
  | {
      type: 'SEND_MESSAGE';
    }
  | {
      type: 'STATUS_CHANGE';
      payload: {
        blockName: string;
        isWorking: boolean;
      };
    }
  | {
      type: 'MESSAGE_RECEIVE';
      payload: {
        blockName: string;
        outputName: string;
        message: string;
      };
    };

export type ChatStatus =
  | 'idle'
  | 'loading'
  | 'errored'
  | 'connected'
  | 'generating';

export type ChatOutputStatus = 'idle' | 'generating';

export type ChatReducerState = {
  error: null | string;
  status: ChatStatus;
  pipelineConfig: WebchatPipelineConfig | null;
  outputsStatus: Record<string, ChatOutputStatus>;
  messages: IMessage[];
};

export const chatReducer = (
  state: ChatReducerState,
  action: Action,
): ChatReducerState => {
  switch (action.type) {
    case 'CONNECT':
      return {
        ...state,
        error: null,
        pipelineConfig: action.payload.data,
        status: 'connected',
        outputsStatus: toOutputStatus(
          action.payload.data.interface_config.outputs,
        ),
      };
    case 'ERROR':
      return {
        ...state,
        error: action.payload.error,
        status: 'errored',
        outputsStatus: setEveryOutputStatus(state.outputsStatus, 'idle'),
      };
    case 'SEND_MESSAGE':
      return { ...state, status: 'generating' };

    case 'STATUS_CHANGE':
      if (Object.keys(state.outputsStatus).includes(action.payload.blockName)) {
        return {
          ...state,
          messages: updateLatestAiMessageStatus(state.messages, action.payload),
          status: action.payload.isWorking ? 'generating' : 'connected',
          outputsStatus: {
            ...state.outputsStatus,
            [action.payload.blockName]: action.payload.isWorking
              ? 'generating'
              : 'idle',
          },
        };
      } else {
        return state;
      }
    case 'MESSAGE_RECEIVE':
      const { blockName, outputName, message } = action.payload;
      const pipelineConfig = state.pipelineConfig;

      if (!pipelineConfig) return state;

      if (isMessageType(pipelineConfig.interface_config.inputs, blockName)) {
        return {
          ...state,
          messages: [
            ...state.messages,
            buildUserMessage(blockName, outputName, message),
          ],
        };
      }

      if (isMessageType(pipelineConfig.interface_config.outputs, blockName)) {
        return {
          ...state,
          messages: upsertAiMessage(state.messages, {
            blockName,
            outputName,
            message,
          }),
        };
      }

      return state;
  }
};

export const connect = (config: WebchatPipelineConfig) => {
  return {
    type: 'CONNECT',
    payload: {
      data: config,
    },
  } as const;
};

export const error = (err: string | null = null) => {
  return {
    type: 'ERROR',
    payload: {
      error: err ? startCase(err) : null,
    },
  } as const;
};

export const send = () => {
  return {
    type: 'SEND_MESSAGE',
  } as const;
};

export const statusChange = (blockName: string, isWorking: boolean) => {
  return {
    type: 'STATUS_CHANGE',
    payload: {
      blockName,
      isWorking,
    },
  } as const;
};

export const messageReceive = (
  blockName: string,
  outputName: string,
  message: string,
) => {
  return {
    type: 'MESSAGE_RECEIVE',
    payload: {
      blockName,
      outputName,
      message,
    },
  } as const;
};

export function getBlockId(blockName: string, outputName: string) {
  return `${blockName}:${outputName}`;
}

function toOutputStatus(
  outputs: IOType[],
  status: ChatOutputStatus = 'idle',
): Record<string, ChatOutputStatus> {
  return outputs.reduce(
    (acc, output) => {
      acc[output.name] = status;
      return acc;
    },
    {} as Record<string, ChatOutputStatus>,
  );
}

function setEveryOutputStatus(
  outputs: Record<string, ChatOutputStatus>,
  status: ChatOutputStatus = 'idle',
) {
  return Object.entries(outputs).reduce(
    (acc, [key]) => {
      acc[key] = status;
      return acc;
    },
    {} as Record<string, ChatOutputStatus>,
  );
}

function upsertAiMessage(
  messages: IMessage[],
  args: { blockName: string; outputName: string; message: string },
) {
  const idx = getNotFinishedBlockMessageIdx(messages, args.blockName);

  if (idx >= 0) {
    const tmpMessages = cloneDeep(messages);

    tmpMessages[idx].message += args.message;

    return tmpMessages;
  }

  return [
    ...messages,
    buildAiMessage(args.blockName, args.outputName, args.message),
  ];
}

function updateLatestAiMessageStatus(
  messages: IMessage[],
  args: { blockName: string; isWorking: boolean },
) {
  if (args.isWorking) return messages;

  const idx = getNotFinishedBlockMessageIdx(messages, args.blockName);

  if (idx >= 0) {
    const tmpMessages = cloneDeep(messages);

    tmpMessages[idx].state = 'done';

    return tmpMessages;
  }

  return messages;
}

function getNotFinishedBlockMessageIdx(
  messages: IMessage[],
  blockName: string,
) {
  return messages.findIndex(
    (msg) =>
      msg.blockName === blockName &&
      msg.state === 'generating' &&
      msg.role === 'ai',
  );
}

function isMessageType(ios: IOType[], blockName: string) {
  return ios.find((io) => io.name === blockName);
}

function buildUserMessage(
  blockName: string,
  outputName: string,
  message: string,
): IMessage {
  return {
    message: message,
    id: uuidv4(),
    role: 'user' as MessageRole,
    created_at: new Date(),
    blockName: blockName,
    blockId: getBlockId(blockName, outputName),
    outputName: outputName,
    state: 'done',
  };
}

function buildAiMessage(
  blockName: string,
  outputName: string,
  message: string,
): IMessage {
  return {
    id: uuidv4(),
    role: 'ai',
    blockName: blockName,
    outputName: outputName,
    blockId: getBlockId(blockName, outputName),
    message: message,
    created_at: new Date(),
    state: 'generating',
  };
}
