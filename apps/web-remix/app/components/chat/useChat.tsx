import { useState } from "react";
import cloneDeep from "lodash.clonedeep";
import { v4 as uuidv4 } from "uuid";
import { errorToast } from "~/components/toasts/errorToast";
import { usePipelineRun } from "~/components/pages/pipelines/usePipelineRun";
import { IMessage, MessageRole } from "./chat.types";

interface UseChatProps {
  inputTopic?: string;
}

export const useChat = ({
  inputTopic = "text_input_1:input",
}: UseChatProps = {}) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const onBlockOutput = (
    _blockId: string,
    _outputName: string,
    payload: unknown
  ) => {
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
    if (isWorking) {
      setIsGenerating(true);
    }
    if (blockId.includes("text_output") && !isWorking) {
      setIsGenerating(false);
    }
  };

  const onError = () => {
    errorToast({ description: "Ups! Something went wrong" });
    setIsGenerating(false);
  };

  const { startRun, stopRun, push, status } = usePipelineRun(
    13,
    135,
    onBlockOutput,
    onStatusChange,
    onError
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

    push(inputTopic, message);
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
