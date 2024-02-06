import React, { PropsWithChildren, useMemo } from "react";
import classNames from "classnames";
import { ItemList } from "~/components/list/ItemList";
import { ClientOnly } from "~/utils/ClientOnly";
import { dayjs } from "~/utils/Dayjs";
import { ChatSize, IMessage, MessageRole } from "./chat.types";
import { ChatMarkdown } from "~/components/chat/ChatMarkdown";

interface ChatMessagesProps {
  messages: IMessage[];
  initialMessages?: IMessage[];
  size?: ChatSize;
}

export function ChatMessages({ messages, initialMessages }: ChatMessagesProps) {
  const reversed = useMemo(() => {
    if (!messages.length) return initialMessages ?? [];
    return messages.map((_, idx) => messages[messages.length - 1 - idx]);
  }, [messages, initialMessages]);

  return (
    <ItemList
      className={classNames(
        "flex flex-col-reverse gap-2 w-full h-[97%] overflow-y-auto pr-1 prose"
      )}
      itemClassName="w-full"
      items={reversed}
      renderItem={(msg) => (
        <>
          <ChatMessage role={msg.role}>
            <ChatMarkdown>{msg.message}</ChatMarkdown>
          </ChatMessage>

          <ClientOnly>
            <MessageTime message={msg} />
          </ClientOnly>
        </>
      )}
    />
  );
}

function MessageTime({ message }: { message: IMessage }) {
  return (
    <span
      className={classNames(
        "block w-fit text-[10px] text-neutral-300 mt-[2px]",
        {
          "ml-auto mr-1": message.role === "user",
        }
      )}
    >
      {dayjs(message.created_at).format("HH:mm")}
    </span>
  );
}

interface ChatMessageProps {
  role: MessageRole;
}

function ChatMessage({ role, children }: PropsWithChildren<ChatMessageProps>) {
  return (
    <article
      className={classNames(
        "w-full max-w-[70%] min-h-[30px] rounded-t-xl border border-neutral-600 px-2 py-1.5 prose",
        {
          "bg-neutral-800 rounded-br-xl": role === "ai",
          "bg-neutral-900 rounded-bl-xl ml-auto mr-0": role !== "ai",
        }
      )}
    >
      {children}
    </article>
  );
}
