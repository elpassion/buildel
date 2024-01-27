import React, { ComponentType, ReactNode } from "react";
import classNames from "classnames";
import { CopyCodeButton } from "~/components/actionButtons/CopyCodeButton";

type Format = "json" | "html" | "block_configuration";

export interface FormatMessageProps {
  children: string;
  className?: string;
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
          nodes.push(<DefaultComponent>{regularText}</DefaultComponent>);
        }
        const FormatComponent = rest[format as Format];

        nodes.push(<FormatComponent>{content}</FormatComponent>);

        lastIndex = index + match.length;
        return match;
      });
    });

    if (lastIndex < message.length) {
      nodes.push(
        <DefaultComponent>{message.substring(lastIndex)}</DefaultComponent>
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
}: FormatMessageProps) {
  return (
    <p
      className={classNames(
        "prose break-words whitespace-pre-wrap text-neutral-200 text-xs",
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
}: FormatMessageProps) {
  return (
    <div
      className={classNames(
        "relative prose break-words whitespace-pre-wrap text-neutral-200 text-xs",
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
