import React, { useEffect } from "react";
import classNames from "classnames";
import { useEl } from "~/components/pages/pipelines/EL/ELProvider";
import { MessageRole } from "~/components/chat/chat.types";
import { useChat } from "~/components/chat/useChat";
import { ChatHeading, ChatStatus } from "~/components/chat/ChatHeading";
import { ChatMessages } from "~/components/chat/ChatMessages";
import { ChatInput } from "~/components/chat/ChatInput";
import { ChatWrapper } from "~/components/chat/ChatWrapper";
import {
  ChatBody,
  ChatCloseButton,
  ChatGeneratingAnimation,
  ChatHeader,
  ChatMessagesWrapper,
} from "~/components/chat/Chat.components";

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

export const ELHelper: React.FC = () => {
  const { isShown, hide } = useEl();
  const {
    isGenerating,
    connectionStatus,
    pushMessage,
    stopRun,
    startRun,
    messages,
  } = useChat();

  useEffect(() => {
    // todo change it
    setTimeout(() => startRun(), 500);

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
      <ChatWrapper>
        <ChatHeader>
          <ChatHeading>
            <ChatStatus connectionStatus={connectionStatus} />
          </ChatHeading>

          <ChatCloseButton onClick={hide} />
        </ChatHeader>

        <ChatBody>
          <ChatMessagesWrapper>
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
        </ChatBody>
      </ChatWrapper>
    </div>
  );
};
