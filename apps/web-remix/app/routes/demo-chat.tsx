import React, { useEffect } from "react";
import { ChatWrapper } from "~/components/chat/ChatWrapper";
import {
  ChatBody,
  ChatGeneratingAnimation,
  ChatHeader,
  ChatMessagesWrapper,
} from "~/components/chat/Chat.components";
import { ChatHeading, ChatStatus } from "~/components/chat/ChatHeading";
import { ChatMessages } from "~/components/chat/ChatMessages";
import { ChatInput } from "~/components/chat/ChatInput";
import { useChat } from "~/components/chat/useChat";

export default function DemoChat() {
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
    <ChatWrapper>
      <ChatHeader>
        <ChatHeading>
          <ChatStatus connectionStatus={connectionStatus} />
        </ChatHeading>
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
            onSubmit={pushMessage}
            disabled={connectionStatus !== "running"}
            generating={isGenerating}
          />
        </div>
      </ChatBody>
    </ChatWrapper>
  );
}
