import React, { useEffect } from "react";
import { ChatWrapper } from "~/components/chat/ChatWrapper";
import { ChatHeading } from "~/components/chat/ChatHeading";
import { ChatMessages } from "~/components/chat/ChatMessages";
import { ChatInput } from "~/components/chat/ChatInput";
import { useChat } from "~/components/chat/useChat";
import {
  ChatGeneratingAnimation,
  ChatHeader,
  ChatMessagesWrapper,
  ChatStatus,
  IntroPanel,
} from "~/components/chat/Chat.components";
import classNames from "classnames";

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
    <div className="flex justify-center items-center h-screen w-full">
      <ChatWrapper className="max-w-[820px] h-[500px] !py-4 relative">
        <ChatHeader className="mb-1">
          <div className="flex gap-2 items-center">
            <ChatHeading>Simple Chat</ChatHeading>
            <ChatStatus connectionStatus={connectionStatus} />
          </div>
        </ChatHeader>

        <ChatMessagesWrapper>
          <ChatMessages size="md" messages={messages} />

          <ChatGeneratingAnimation
            messages={messages}
            isGenerating={isGenerating}
          />
        </ChatMessagesWrapper>

        <ChatInput
          onSubmit={pushMessage}
          disabled={connectionStatus !== "running"}
          generating={isGenerating}
        />

        <IntroPanel className={classNames({ hidden: !!messages.length })}>
          <p>Ask me anything!</p>
        </IntroPanel>
      </ChatWrapper>
    </div>
  );
}
