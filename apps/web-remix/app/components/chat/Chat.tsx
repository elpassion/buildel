import React, { useEffect, useState } from "react";
import cloneDeep from "lodash.clonedeep";
import { v4 as uuidv4 } from "uuid";
import { usePipelineRun } from "~/components/pages/pipelines/usePipelineRun";
import { errorToast } from "~/components/toasts/errorToast";
import { IMessage, MessageRole } from "./chat.types";
import { ChatHeading, ChatStatus } from "./ChatHeading";
import { ChatMessages } from "./ChatMessages";
import { ChatWrapper } from "./ChatWrapper";
import { ChatInput } from "./ChatInput";
import {
  ChatBody,
  ChatCloseButton,
  ChatGeneratingAnimation,
  ChatHeader,
  ChatMessagesWrapper,
} from "./Chat.components";

interface ChatProps {
  onClose: () => void;
  inputTopic: string;
}

export const Chat: React.FC<ChatProps> = ({ onClose, inputTopic }) => {
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

  // const handleShowEL = async () => {
  //   show();
  //   if (status === "idle") {
  //     await startRun();
  //   }
  // };
  //
  // const handleHideEL = async () => {
  //   hide();
  //   // await stopRun();
  //   setIsGenerating(false);
  //   // clearMessages();
  // };

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

  useEffect(() => {
    // todo change it
    setTimeout(() => startRun(), 500);

    return () => {
      stopRun();
    };
  }, []);

  return (
    <ChatWrapper>
      <ChatHeader>
        <ChatHeading>
          <ChatStatus connectionStatus={status} />
        </ChatHeading>

        <ChatCloseButton onClick={onClose} />
      </ChatHeader>

      <ChatBody>
        <ChatMessagesWrapper>
          <ChatMessages messages={messages} />

          <ChatGeneratingAnimation
            messages={messages}
            isGenerating={isGenerating}
          />
        </ChatMessagesWrapper>

        <div className="mt-2">
          <ChatInput
            onSubmit={handlePush}
            disabled={status !== "running"}
            generating={isGenerating}
          />
        </div>
      </ChatBody>
    </ChatWrapper>
  );
};
