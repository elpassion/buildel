import { useState } from 'react';
import cloneDeep from 'lodash.clonedeep';
import { v4 as uuidv4 } from 'uuid';

import { usePipelineRun } from '~/components/pages/pipelines/usePipelineRun';

import type { IMessage, MessageRole } from './chat.types';

type IOType = { name: string; type: string };

interface UseChatProps {
  inputs: IOType[];
  outputs: IOType[];
  organizationId: number;
  pipelineId: number;
  onBlockOutput?: (
    blockId: string,
    outputName: string,
    payload: unknown,
  ) => void;
  onFinish?: () => void;
  useAuth?: boolean;
  onBlockStatusChange?: (blockId: string, isWorking: boolean) => void;
}

export const useChat = ({
  inputs,
  outputs,
  organizationId,
  pipelineId,
  onBlockOutput: onBlockOutputProps,
  onFinish,
  useAuth,
  onBlockStatusChange,
}: UseChatProps) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [outputsGenerating, setOutputsGenerating] = useState(
    outputs.reduce(
      (acc, output) => {
        acc[output.name] = false;
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );

  const useAuthWithDefault = useAuth ?? true;

  const onBlockOutput = (
    blockName: string,
    outputName: string,
    payload: unknown,
  ) => {
    onBlockOutputProps?.(blockName, outputName, payload);
    console.log(blockName, outputName, payload);
    if (!Object.keys(outputsGenerating).includes(blockName)) return;

    setMessages((prev) => {
      const tmpPrev = cloneDeep(prev);
      const lastBlockMessageIdx = tmpPrev.findIndex(
        (msg) =>
          msg.blockName === blockName &&
          msg.state === 'generating' &&
          msg.role === 'ai',
      );

      if (lastBlockMessageIdx >= 0) {
        tmpPrev[lastBlockMessageIdx].message += (
          payload as { message: string }
        ).message;

        return tmpPrev;
      }

      return [
        ...prev,
        {
          id: uuidv4(),
          role: 'ai',
          blockName: blockName,
          outputName: outputName,
          blockId: getBlockId(blockName, outputName),
          message: (payload as { message: string }).message,
          created_at: new Date(),
          state: 'generating',
        },
      ];
    });
  };

  const onStatusChange = (blockName: string, isWorking: boolean) => {
    onBlockStatusChange?.(blockName, isWorking);

    if (Object.keys(outputsGenerating).includes(blockName)) {
      setOutputsGenerating((prev) => {
        return {
          ...prev,
          [blockName]: isWorking,
        };
      });

      if (!isWorking) {
        setMessages((prev) => {
          const tmpPrev = cloneDeep(prev);
          const lastBlockMessageIdx = tmpPrev.findIndex(
            (msg) =>
              msg.blockName === blockName &&
              msg.state === 'generating' &&
              msg.role === 'ai',
          );

          if (lastBlockMessageIdx >= 0) {
            tmpPrev[lastBlockMessageIdx].state = 'done';
          }

          return tmpPrev;
        });
      }
    }

    if (Object.values(outputsGenerating).every((v) => !v)) {
      onFinish?.();
    }
  };

  const onBlockError = () => {
    // errorToast({ description: 'Ups! Something went wrong' });
    setOutputsGenerating(setOutputsGeneratingValue(outputsGenerating, false));
  };

  const onError = () => {
    // errorToast({ description: error });
    setOutputsGenerating(setOutputsGeneratingValue(outputsGenerating, false));
  };

  const { startRun, stopRun, push, status, id } = usePipelineRun(
    organizationId,
    pipelineId,
    onBlockOutput,
    onStatusChange,
    onBlockError,
    onError,
    useAuthWithDefault,
  );

  const clearMessages = () => {
    setMessages([]);
  };

  const handlePush = (message: string) => {
    if (!message.trim() || inputs.length <= 0) return;

    setOutputsGenerating(setOutputsGeneratingValue(outputsGenerating, true));

    const parsedMessage = parseTextToObjects(message);
    console.log(parsedMessage);
    const messages: IMessage[] = [];

    if (parsedMessage.length === 0) {
      messages.push({
        message,
        id: uuidv4(),
        role: 'user' as MessageRole,
        created_at: new Date(),
        blockName: inputs[0].name,
        outputName: 'input',
        blockId: getBlockId(inputs[0].name, 'input'),
        state: 'done',
      });
    } else {
      parsedMessage.forEach((parsedMessage) => {
        if (
          parsedMessage.input &&
          inputs.map((input) => input.name).includes(parsedMessage.input)
        ) {
          messages.push({
            message: parsedMessage.text,
            id: uuidv4(),
            role: 'user' as MessageRole,
            created_at: new Date(),
            blockName: parsedMessage.input,
            outputName: 'input',
            blockId: getBlockId(parsedMessage.input, 'input'),
            state: 'done',
          });
        } else {
          messages.push({
            message: parsedMessage.text,
            id: uuidv4(),
            role: 'user' as MessageRole,
            created_at: new Date(),
            blockName: inputs[0].name,
            outputName: 'input',
            blockId: getBlockId(inputs[0].name, 'input'),
            state: 'done',
          });
        }
      });
    }

    setMessages((prev) => [...prev, ...messages]);
    console.log(messages);
    messages.forEach((message) => {
      push(message.blockId, message.message);
    });
  };

  return {
    stopRun,
    messages,
    startRun,
    isGenerating: Object.values(outputsGenerating).some((v) => v),
    clearMessages,
    pushMessage: handlePush,
    connectionStatus: status,
    runId: id,
  };
};

function getBlockId(blockName: string, outputName: string) {
  return `${blockName}:${outputName}`;
}

function setOutputsGeneratingValue(
  outputs: Record<string, boolean>,
  value: boolean,
) {
  return Object.entries(outputs).reduce(
    (acc, [key]) => {
      acc[key] = value;
      return acc;
    },
    {} as Record<string, boolean>,
  );
}

interface InputText {
  input: string | null;
  text: string;
}

const parseTextToObjects = (input: string): InputText[] => {
  const regex = /(@\S+)\s+([^@]+)/g;
  const result: InputText[] = [];

  let lastIndex = 0;

  Array.from(input.matchAll(regex)).forEach((match) => {
    const mention = match[1];
    const textPart = match[2].trim();

    if (match.index! > lastIndex) {
      const textBeforeMention = input.slice(lastIndex, match.index).trim();
      if (textBeforeMention) {
        result.push({ input: null, text: textBeforeMention });
      }
    }

    result.push({ input: mention.replace('@', ''), text: textPart });
    lastIndex = match.index! + match[0].length;
  });

  return result;
};
