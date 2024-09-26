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
  const [isGenerating, setIsGenerating] = useState(false);
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

    const input = inputs.find((input) => input.name === blockName);

    if (input) {
      setMessages((prev) => [
        ...prev,
        {
          message: (payload as { message: string }).message,
          id: uuidv4(),
          role: 'user' as MessageRole,
          created_at: new Date(),
          blockName: input.name,
          outputName: 'input',
          blockId: getBlockId(input.name, 'input'),
          state: 'done',
        },
      ]);
    }

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

      if (isWorking) {
        setIsGenerating(false);
      } else {
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
    setIsGenerating(false);
    setOutputsGenerating(setOutputsGeneratingValue(outputsGenerating, false));
  };

  const onError = () => {
    setIsGenerating(false);
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
    const messages: IMessage[] = [];

    const { inputs: mentionInputs, text } = retrieveInputsFromMessage(message);

    const baseMessage: IMessage = {
      message: text,
      id: uuidv4(),
      role: 'user' as MessageRole,
      created_at: new Date(),
      blockName: inputs[0].name,
      outputName: 'input',
      blockId: getBlockId(inputs[0].name, 'input'),
      state: 'done',
    };

    if (mentionInputs.length === 0) {
      messages.push(baseMessage);
    } else {
      mentionInputs.forEach((mention) => {
        if (inputs.map((input) => input.name).includes(mention)) {
          messages.push({
            message: text,
            id: uuidv4(),
            role: 'user' as MessageRole,
            created_at: new Date(),
            blockName: mention,
            outputName: 'input',
            blockId: getBlockId(mention, 'input'),
            state: 'done',
          });
        } else {
          messages.push(baseMessage);
        }
      });
    }

    messages.forEach((message) => {
      push(message.blockId, message.message);
    });

    setIsGenerating(true);
  };

  return {
    stopRun,
    messages,
    startRun,
    isGenerating:
      isGenerating || Object.values(outputsGenerating).some((v) => v),
    clearMessages,
    pushMessage: handlePush,
    connectionStatus: status,
    runId: id,
    push,
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
