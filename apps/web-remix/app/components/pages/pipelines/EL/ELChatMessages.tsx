import React, { useMemo } from "react";
import classNames from "classnames";
import { ItemList } from "~/components/list/ItemList";
import { ClientOnly } from "~/utils/ClientOnly";
import { dayjs } from "~/utils/Dayjs";
import { ChatMessageFormats } from "~/components/pages/ChatMessageFormats/ChatMessageFormats";
import { IMessage, MessageStatusType, MessageType } from "./EL.types";
import { useEl } from "./ELProvider";

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
          "ml-auto mr-1": message.type === "user",
        }
      )}
    >
      {dayjs(message.created_at).format("HH:mm")}
    </span>
  );
}

interface ChatMessageProps {
  data: IMessage;
}

function ChatMessage({ data }: ChatMessageProps) {
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
      <ChatMessageFormats message={data.message} />
    </article>
  );
}
