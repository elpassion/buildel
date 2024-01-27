import React, { PropsWithChildren } from "react";
import { Icon } from "@elpassion/taco";
import { IMessage } from "~/components/chat/chat.types";
interface ChatCloseButtonProps {
  onClick: () => void;
}

export const ChatCloseButton: React.FC<ChatCloseButtonProps> = ({
  onClick,
}) => {
  return (
    <button onClick={onClick} className="text-neutral-200 hover:text-white">
      <Icon iconName="x" />
    </button>
  );
};

export const ChatHeader: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <header className="flex justify-between gap-2 items-center mb-3">
      {children}
    </header>
  );
};

export const ChatBody: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className="w-full">{children}</div>;
};

export const ChatMessagesWrapper: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <div className="w-full border border-neutral-800 rounded-lg px-2 py-3">
      {children}
    </div>
  );
};

interface ChatGeneratingAnimationProps {
  messages: IMessage[];
  isGenerating: boolean;
}

export const ChatGeneratingAnimation = ({
  messages,
  isGenerating,
}: ChatGeneratingAnimationProps) => {
  const renderMessage = () => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];

    if (
      lastMessage.role === "user" ||
      (lastMessage.role === "ai" && !lastMessage.message.length)
    ) {
      return "Thinking...";
    }

    return "Generating...";
  };

  if (!isGenerating) return null;
  return (
    <div className="flex gap-0.5 items-center mt-1">
      <span className="text-[10px] text-neutral-400 mr-1">
        {renderMessage()}
      </span>
      <div className="w-1 h-1 rounded-full bg-secondary-400 animate-bounce" />
      <div className="w-1 h-1 rounded-full bg-secondary-800 animate-[bounce_1s_0.5s_ease-in-out_infinite]" />
      <div className="w-1 h-1 rounded-full bg-secondary-600 animate-bounce" />
    </div>
  );
};
