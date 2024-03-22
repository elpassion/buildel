import { useState } from "react";
import cloneDeep from "lodash.clonedeep";
import { v4 as uuidv4 } from "uuid";
import { errorToast } from "~/components/toasts/errorToast";
import { usePipelineRun } from "~/components/pages/pipelines/usePipelineRun";
import { IMessage, MessageRole } from "./chat.types";

interface UseChatProps {
  input: string;
  output: string;
  chat: string;
  organizationId: number;
  pipelineId: number;
  onBlockOutput?: (
    blockId: string,
    outputName: string,
    payload: unknown,
  ) => void;
  onFinish?: () => void;
  useAuth?: boolean;
}

export const useChat = ({
  input,
  output,
  chat,
  organizationId,
  pipelineId,
  onBlockOutput: onBlockOutputProps,
  onFinish,
  useAuth,
}: UseChatProps) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const useAuthWithDefault = useAuth ?? true;
  console.log(useAuthWithDefault);

  const onBlockOutput = (
    blockId: string,
    _outputName: string,
    payload: unknown,
  ) => {
    onBlockOutputProps?.(blockId, _outputName, payload);
    // todo: just text_output for now
    if (!blockId.includes(output)) return;

    setMessages((prev) => {
      const tmpPrev = cloneDeep(prev);
      const lastMessage = tmpPrev[tmpPrev.length - 1];

      if (lastMessage && lastMessage.role === "ai") {
        tmpPrev[tmpPrev.length - 1].message += (
          payload as { message: string }
        ).message;

        return tmpPrev;
      }

      return [
        ...prev,
        {
          id: uuidv4(),
          role: "ai",
          message: (payload as { message: string }).message,
          created_at: new Date(),
        },
      ];
    });
  };

  const onStatusChange = (blockId: string, isWorking: boolean) => {
    if (blockId.includes(input) && isWorking) {
      setIsGenerating(true);
    }

    if (blockId.includes(chat) && !isWorking) {
      setIsGenerating(false);
      onFinish?.();
    }
  };

  const onError = () => {
    errorToast({ description: "Ups! Something went wrong" });
    setIsGenerating(false);
  };

  const { startRun, stopRun, push, status } = usePipelineRun(
    organizationId,
    pipelineId,
    onBlockOutput,
    onStatusChange,
    onError,
    useAuthWithDefault,
  );

  const clearMessages = () => {
    setMessages([]);
  };

  const handlePush = (message: string) => {
    if (!message.trim()) return;

    const newMessage = {
      message,
      id: uuidv4(),
      role: "user" as MessageRole,
      created_at: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    push(input + ":input", message);
  };

  return {
    stopRun,
    messages,
    startRun,
    isGenerating,
    clearMessages,
    pushMessage: handlePush,
    connectionStatus: status,
  };
};
