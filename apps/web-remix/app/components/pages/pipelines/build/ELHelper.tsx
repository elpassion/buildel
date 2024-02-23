import React, { useEffect } from "react";
import classNames from "classnames";
import { useEl } from "~/components/pages/pipelines/EL/ELProvider";
import { MessageRole } from "~/components/chat/chat.types";
import { useChat } from "~/components/chat/useChat";
import { ChatHeading } from "~/components/chat/ChatHeading";
import { ChatMessages } from "~/components/chat/ChatMessages";
import { ChatInput } from "~/components/chat/ChatInput";
import { ChatWrapper } from "~/components/chat/ChatWrapper";
import {
  ChatCloseButton,
  ChatGeneratingAnimation,
  ChatHeader,
  ChatMessagesWrapper,
  ChatStatus,
} from "~/components/chat/Chat.components";
import { Icon } from "@elpassion/taco";

const INITIAL_MESSAGES = [
  {
    message:
      "I'm EL, your AI helper here at Buildel. Feel free to ask me anything about creating the perfect workflow for you in the application.",
    role: "ai" as MessageRole,
    created_at: new Date(),
    id: "2",
  },
  {
    message: "👋 Hi there!",
    role: "ai" as MessageRole,
    created_at: new Date(),
    id: "1",
  },
];

interface ELHelperProps {
  pipelineId: string;
  organizationId: string;
  onBlockCreate: () => void;
}

export const ELHelper: React.FC<ELHelperProps> = ({
  pipelineId,
  organizationId,
  onBlockCreate,
}) => {
  const { isShown, hide } = useEl();
  const {
    isGenerating,
    connectionStatus,
    pushMessage,
    stopRun,
    startRun,
    messages,
  } = useChat({
    pipelineId: 135,
    organizationId: 13,
    chat: "chat_1",
    input: "text_input_1",
    output: "text_output_1",
    onFinish: onBlockCreate,
  });

  useEffect(() => {
    // todo change it
    setTimeout(
      () =>
        startRun([
          { name: "text_input_2:input", value: organizationId },
          { name: "text_input_3:input", value: pipelineId },
        ]),
      500
    );

    return () => {
      stopRun();
    };
  }, []);

  return (
    <div
      className={classNames(
        "absolute top-8 z-10 right-0 transition md:right-4",
        {
          "opacity-0 pointer-events-none scale-90": !isShown,
          "opacity-100 pointer-events-auto scale-100": isShown,
        }
      )}
    >
      <ChatWrapper className="!w-[440px]">
        <ChatHeader>
          <div className="flex gap-2 items-center">
            <ChatHeading>
              <Icon size="xs" iconName="two-layers" />
              <div className="text-white">Ask EL</div>
            </ChatHeading>
            <ChatStatus connectionStatus={connectionStatus} />
          </div>

          <ChatCloseButton onClick={hide} />
        </ChatHeader>

        <ChatMessagesWrapper
          className={classNames({
            "h-[300px]": !!messages.length,
            "h-[180px]": !messages.length,
          })}
        >
          <ChatMessages
            messages={messages}
            initialMessages={INITIAL_MESSAGES}
          />

          <ChatGeneratingAnimation
            messages={messages}
            isGenerating={isGenerating}
          />
        </ChatMessagesWrapper>

        <div className="mt-2">
          <ChatInput
            onSubmit={pushMessage}
            disabled={connectionStatus !== "running"}
            generating={isGenerating}
          />
        </div>
      </ChatWrapper>
    </div>
  );
};
