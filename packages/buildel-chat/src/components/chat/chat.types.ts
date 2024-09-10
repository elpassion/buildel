import React from "react";
import { UsePipelineRunArgs } from "~/hooks/usePipelineRun.tsx";
import { ItemListProps } from "~/components/list/ItemList.tsx";
import { MarkdownToJSX } from "markdown-to-jsx";
import { BuildelRunStatus } from "@buildel/buildel";

export type MessageRole = "ai" | "user";

export interface IMessage {
  id: string;
  role: MessageRole;
  blockName: string;
  outputName: string;
  blockId: string;
  message: string;
  created_at: Date;
  state: "generating" | "done";
}

export type ChatSize = "sm" | "default";

export type IOType = { name: string; type: string };

export interface UseChatProps extends UsePipelineRunArgs {
  inputs: IOType[];
  outputs: IOType[];
  onFinish?: () => void;
}

export interface ChatWrapperProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface ChatMessagesProps
  extends Omit<ItemListProps<IMessage>, "items" | "renderItem"> {
  messages: IMessage[];
  initialMessages?: IMessage[];
  size?: ChatSize;
}

export interface ChatMarkdownProps {
  [key: string]: any;
  children: string;
  options?: MarkdownToJSX.Options;
}

export interface ChatInputProps {
  onSubmit: (message: string) => void;
  generating?: boolean;
  disabled?: boolean;
  prefix?: React.ReactNode;
  attachments?: React.ReactNode;
  placeholder?: string;
  size?: ChatSize;
  className?: string;
  suggestions?: string[];
}

export interface ChatHeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export interface ChatHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface ChatMessagesWrapperProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface ChatGeneratingAnimationProps
  extends React.HTMLAttributes<HTMLDivElement> {
  messages: IMessage[];
  isGenerating: boolean;
  size?: ChatSize;
}

export interface ChatStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  connectionStatus: BuildelRunStatus;
}

export interface IntroPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ChatSize;
}

export interface SuggestedMessagesProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: ChatSize;
}

export interface SuggestedMessageProps
  extends Omit<
    React.HTMLAttributes<HTMLButtonElement>,
    "children" | "onClick"
  > {
  onClick: (message: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  content: string;
  disabled?: boolean;
  size?: ChatSize;
  wrapperClassName?: string;
}
