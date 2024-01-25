import React, { PropsWithChildren, ReactNode, useMemo } from "react";
import { ItemList } from "~/components/list/ItemList";
import classNames from "classnames";
import { dayjs } from "~/utils/Dayjs";
import { IMessage, MessageStatusType, MessageType } from "./EL.types";
import { useEl } from "./ELProvider";
import { CopyCodeButton } from "~/components/actionButtons/CopyCodeButton";

const EMPTY_MESSAGES = [
  {
    message:
      "I'm EL, your AI helper here at Buildel. Feel free to ask me anything about creating the perfect workflow for you in the application.",
    type: "ai" as MessageType,
    created_at: new Date(),
    status: "finished" as MessageStatusType,
    id: "2",
  },
  {
    message: "👋 Hi there!",
    type: "ai" as MessageType,
    created_at: new Date(),
    status: "finished" as MessageStatusType,
    id: "1",
  },
];

export function ELChatMessages() {
  const { messages } = useEl();

  const reversed = useMemo(() => {
    if (!messages.length) return EMPTY_MESSAGES;
    return messages.map((_, idx) => messages[messages.length - 1 - idx]);
  }, [messages]);

  return (
    <ItemList
      className={classNames(
        "flex flex-col-reverse gap-2 w-full overflow-y-auto pr-1",
        { "h-[300px]": !!messages.length, "h-[150px]": !messages.length }
      )}
      itemClassName="w-full"
      items={reversed}
      renderItem={(msg) => (
        <>
          <ChatMessage data={msg} />
          <span
            className={classNames(
              "block w-fit text-[10px] text-neutral-300 mt-[2px]",
              {
                "ml-auto mr-1": msg.type === "user",
              }
            )}
          >
            {dayjs(msg.created_at).format("HH:mm")}
          </span>
        </>
      )}
    />
  );
}

interface ChatMessageProps {
  data: IMessage;
}

const formats = [
  { regex: /```json([\s\S]*?)```/g },
  { regex: /```html([\s\S]*?)```/g },
  { regex: /```block_configuration([\s\S]*?)```/g },
];

function ChatMessage({ data }: ChatMessageProps) {
  const formatMessage = (message: string) => {
    let lastIndex = 0;
    const nodes: ReactNode[] = [];

    formats.forEach((format) => {
      message.replace(format.regex, (match, jsonContent, index) => {
        const regularText = message.substring(lastIndex, index);
        if (regularText) {
          nodes.push(
            <ChatMessageParagraph>{regularText}</ChatMessageParagraph>
          );
        }

        nodes.push(<ChatMessageCode>{jsonContent}</ChatMessageCode>);

        lastIndex = index + match.length;
        return match;
      });
    });

    if (lastIndex < message.length) {
      nodes.push(
        <ChatMessageParagraph>
          {message.substring(lastIndex)}
        </ChatMessageParagraph>
      );
    }

    return nodes.map((node, index) => (
      <React.Fragment key={index}>{node}</React.Fragment>
    ));
  };

  return (
    <article
      className={classNames(
        "w-full max-w-[70%] min-h-[30px] rounded-t-xl border border-neutral-600 px-2 py-1.5",
        {
          "bg-neutral-800 rounded-br-xl": data.type === "ai",
          "bg-neutral-900 rounded-bl-xl ml-auto mr-0": data.type !== "ai",
        }
      )}
    >
      <div className="prose break-words whitespace-pre-wrap text-neutral-200 text-xs">
        {formatMessage(data.message)}
      </div>
    </article>
  );
}

function ChatMessageParagraph({ children }: PropsWithChildren) {
  return (
    <p className="prose break-words whitespace-pre-wrap text-neutral-200 text-xs">
      {children}
    </p>
  );
}

function ChatMessageCode({ children }: { children: string }) {
  return (
    <div className="relative">
      <div className="absolute top-1 right-1 !text-sm">
        <CopyCodeButton value={children} />
      </div>
      <pre className="my-1 bg-neutral-900">
        <code>{children}</code>
      </pre>
    </div>
  );
}
