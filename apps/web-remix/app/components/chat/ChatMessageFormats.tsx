import React, { ComponentType, ReactNode } from "react";
import classNames from "classnames";
import { CopyCodeButton } from "~/components/actionButtons/CopyCodeButton";
import { ChatSize } from "~/components/chat/chat.types";

type Format = "json" | "html" | "block_configuration";

export interface FormatMessageProps {
  children: string;
  className?: string;
  size?: ChatSize;
}

interface FormatComponents {
  default: ComponentType<FormatMessageProps>;
  json: ComponentType<FormatMessageProps>;
  html: ComponentType<FormatMessageProps>;
  block_configuration: ComponentType<FormatMessageProps>;
}

interface ChatMessageFormatsProps {
  message: string;
  formatComponents?: Partial<FormatComponents>;
  size?: ChatSize;
}

const DEFAULT_FORMAT_COMPONENTS: FormatComponents = {
  default: ChatMessageDefaultFormat,
  json: ChatMessageCodeFormat,
  html: ChatMessageCodeFormat,
  block_configuration: ChatMessageCodeFormat,
};

const formats: Record<Format, RegExp> = {
  json: /```json([\s\S]*?)```/g,
  html: /```html([\s\S]*?)```/g,
  block_configuration: /```block_configuration([\s\S]*?)```/g,
};

export function ChatMessageFormats({
  message,
  formatComponents,
  size = "sm",
}: ChatMessageFormatsProps) {
  const { default: DefaultComponent, ...rest } = {
    ...DEFAULT_FORMAT_COMPONENTS,
    ...formatComponents,
  };
  const formatMessage = (message: string) => {
    let lastIndex = 0;
    const nodes: ReactNode[] = [];

    Object.keys(formats).forEach((format) => {
      message.replace(formats[format as Format], (match, content, index) => {
        const regularText = message.substring(lastIndex, index);
        if (regularText) {
          nodes.push(
            <DefaultComponent size={size}>{regularText}</DefaultComponent>
          );
        }
        const FormatComponent = rest[format as Format];

        nodes.push(<FormatComponent size={size}>{content}</FormatComponent>);

        lastIndex = index + match.length;
        return match;
      });
    });

    if (lastIndex < message.length) {
      nodes.push(
        <DefaultComponent size={size}>
          {message.substring(lastIndex)}
        </DefaultComponent>
      );
    }

    return nodes.map((node, index) => (
      <React.Fragment key={index}>{node}</React.Fragment>
    ));
  };

  return formatMessage(message);
}

export function ChatMessageDefaultFormat({
  children,
  className,
  size = "sm",
}: FormatMessageProps) {
  return (
    <p
      className={classNames(
        "prose break-words whitespace-pre-wrap text-neutral-200",
        messageSize(size),
        className
      )}
    >
      {children}
    </p>
  );
}

export function ChatMessageCodeFormat({
  children,
  className,
  size = "sm",
}: FormatMessageProps) {
  return (
    <div
      className={classNames(
        "relative prose break-words whitespace-pre-wrap text-neutral-200",
        messageSize(size),
        className
      )}
    >
      <div className="absolute top-1 right-1 !text-sm">
        <CopyCodeButton value={children} />
      </div>
      <pre className="my-1 bg-neutral-900">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function messageSize(size?: ChatSize) {
  if (size === "md") return "text-sm";
  return "text-xs";
}
