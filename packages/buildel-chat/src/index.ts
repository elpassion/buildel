import {
  ChatGeneratingAnimation,
  ChatHeader,
  ChatMessagesWrapper,
  ChatStatus,
  IntroPanel,
  SuggestedMessage,
  SuggestedMessages,
} from "~/components/chat/Chat.components";
import { ChatHeading } from "~/components/chat/ChatHeading";
import { ChatInput } from "~/components/chat/ChatInput";
import { ChatMessages } from "~/components/chat/ChatMessages";
import { ChatWrapper } from "~/components/chat/ChatWrapper";
import { useChat } from "~/components/chat/useChat";

import type {
  ChatSize,
  IMessage,
  ChatMessagesProps,
  ChatInputProps,
  ChatHeaderProps,
  ChatMessagesWrapperProps,
  ChatGeneratingAnimationProps,
  ChatStatusProps,
  IntroPanelProps,
  SuggestedMessageProps,
  SuggestedMessagesProps,
  ChatHeadingProps,
} from "~/components/chat/chat.types";

import "./index.css";

export {
  useChat,
  ChatWrapper,
  ChatMessages,
  ChatInput,
  ChatHeading,
  SuggestedMessages,
  SuggestedMessage,
  IntroPanel,
  ChatStatus,
  ChatMessagesWrapper,
  ChatHeader,
  ChatGeneratingAnimation,
};

export type {
  ChatSize,
  IMessage,
  ChatMessagesProps,
  ChatInputProps,
  ChatHeaderProps,
  ChatMessagesWrapperProps,
  ChatGeneratingAnimationProps,
  ChatStatusProps,
  IntroPanelProps,
  SuggestedMessageProps,
  SuggestedMessagesProps,
  ChatHeadingProps,
};
